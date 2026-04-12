import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetService } from './password-reset.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import {
  PasswordResetTooManyRequestsException,
  PasswordResetTooManyAttemptsException,
} from './password-reset.exception';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let prisma: any;
  let emailService: any;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    startAction: jest.fn().mockReturnValue({ transactionId: 'test-tx' }),
    endAction: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    authType: 'EMAIL',
    isEmailVerified: true,
  };

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      passwordReset: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      session: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmailService },
        { provide: 'Logger', useValue: mockLogger },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
    prisma = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('requestReset', () => {
    it('should return silent success for non-existent email (prevent enumeration)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.requestReset({
        transactionId: 'tx-1',
        email: 'nonexistent@example.com',
      });

      expect(result).toEqual({
        success: true,
        message: 'If this email exists, a reset code has been sent.',
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should return silent success for non-EMAIL auth type', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        authType: 'LINKEDIN',
      });

      const result = await service.requestReset({
        transactionId: 'tx-1',
        email: mockUser.email,
      });

      expect(result).toEqual({
        success: true,
        message: 'If this email exists, a reset code has been sent.',
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should use a transaction for the upsert to prevent race conditions', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          passwordReset: {
            findUnique: jest.fn().mockResolvedValue(null), // No existing reset
            upsert: jest.fn().mockResolvedValue({}),
          },
        };
        return cb(tx);
      });

      await service.requestReset({
        transactionId: 'tx-1',
        email: mockUser.email,
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockUser.email,
          type: 'reset-password',
        }),
      );
    });

    it('should throw if a reset was requested less than 60 seconds ago (cooldown)', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          passwordReset: {
            findUnique: jest.fn().mockResolvedValue({
              userId: mockUser.id,
              updatedAt: new Date(), // Just now — within 60s cooldown
            }),
            upsert: jest.fn(),
          },
        };
        return cb(tx);
      });

      await expect(
        service.requestReset({
          transactionId: 'tx-1',
          email: mockUser.email,
        }),
      ).rejects.toThrow();

      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should allow reset if last request was more than 60 seconds ago', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          passwordReset: {
            findUnique: jest.fn().mockResolvedValue({
              userId: mockUser.id,
              updatedAt: new Date(Date.now() - 120_000), // 2 minutes ago — outside cooldown
            }),
            upsert: jest.fn().mockResolvedValue({}),
          },
        };
        return cb(tx);
      });

      const result = await service.requestReset({
        transactionId: 'tx-1',
        email: mockUser.email,
      });

      expect(result).toEqual({
        success: true,
        message: 'If this email exists, a reset code has been sent.',
      });
      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it('should create new reset when no existing record (first request)', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const mockUpsert = jest.fn().mockResolvedValue({});
      prisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          passwordReset: {
            findUnique: jest.fn().mockResolvedValue(null),
            upsert: mockUpsert,
          },
        };
        return cb(tx);
      });

      await service.requestReset({
        transactionId: 'tx-1',
        email: mockUser.email,
      });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
          create: expect.objectContaining({
            userId: mockUser.id,
            isCodeVerified: false,
            attempts: 0,
          }),
          update: expect.objectContaining({
            isCodeVerified: false,
            attempts: 0,
          }),
        }),
      );
    });
  });

  describe('verifyCode', () => {
    const mockPasswordReset = {
      id: 'reset-1',
      userId: mockUser.id,
      resetCode: 'AB12',
      resetToken: 'token-123',
      codeExpiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 min in future
      isCodeVerified: false,
      attempts: 0,
    };

    it('should throw if token is invalid', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyCode({
          transactionId: 'tx-1',
          code: 'AB12',
          token: 'invalid-token',
        }),
      ).rejects.toThrow();
    });

    it('should throw if code has expired', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue({
        ...mockPasswordReset,
        codeExpiresAt: new Date(Date.now() - 1000), // Expired
      });

      await expect(
        service.verifyCode({
          transactionId: 'tx-1',
          code: 'AB12',
          token: 'token-123',
        }),
      ).rejects.toThrow();
    });

    it('should throw TooManyAttempts if attempts >= 5', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue({
        ...mockPasswordReset,
        attempts: 5,
      });

      await expect(
        service.verifyCode({
          transactionId: 'tx-1',
          code: 'AB12',
          token: 'token-123',
        }),
      ).rejects.toThrow();
    });

    it('should increment attempts on wrong code', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue({
        ...mockPasswordReset,
        attempts: 2,
      });
      prisma.passwordReset.update.mockResolvedValue({});

      await expect(
        service.verifyCode({
          transactionId: 'tx-1',
          code: 'WRONG',
          token: 'token-123',
        }),
      ).rejects.toThrow();

      expect(prisma.passwordReset.update).toHaveBeenCalledWith({
        where: { id: mockPasswordReset.id },
        data: { attempts: { increment: 1 } },
      });
    });

    it('should verify code successfully and reset attempts', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue(mockPasswordReset);
      prisma.passwordReset.update.mockResolvedValue({});

      const result = await service.verifyCode({
        transactionId: 'tx-1',
        code: 'AB12',
        token: 'token-123',
      });

      expect(result).toEqual({
        success: true,
        message: 'Code verified successfully',
      });
      expect(prisma.passwordReset.update).toHaveBeenCalledWith({
        where: { id: mockPasswordReset.id },
        data: { isCodeVerified: true, attempts: 0 },
      });
    });

    it('should verify code case-insensitively', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue(mockPasswordReset);
      prisma.passwordReset.update.mockResolvedValue({});

      const result = await service.verifyCode({
        transactionId: 'tx-1',
        code: 'ab12', // lowercase
        token: 'token-123',
      });

      expect(result).toEqual({
        success: true,
        message: 'Code verified successfully',
      });
    });

    it('should block at exactly 5 attempts even with correct code', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue({
        ...mockPasswordReset,
        attempts: 5,
        resetCode: 'AB12',
      });

      await expect(
        service.verifyCode({
          transactionId: 'tx-1',
          code: 'AB12', // Correct code but too many attempts
          token: 'token-123',
        }),
      ).rejects.toThrow();

      // Should NOT update (no verification, no increment)
      expect(prisma.passwordReset.update).not.toHaveBeenCalled();
    });
  });
});
