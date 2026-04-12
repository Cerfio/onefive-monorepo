import { Test, TestingModule } from '@nestjs/testing';
import { SignupHandler } from './signup.handler';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { SessionsService } from '../../sessions/sessions.service';
import { ReferralService } from '../../referral/referral.service';
import { EmailVerificationService } from '../../email-verification/email-verification.service';
import { EmailService } from '../../email/email.service';
import { LogService } from 'logstash-winston-3';
import { AuthType } from '@prisma/client';
import { AuthenticationEmailAlreadyExistException } from '../auth.exception';

describe('SignupHandler', () => {
  let handler: SignupHandler;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;
  let sessionService: jest.Mocked<SessionsService>;
  let emailService: jest.Mocked<EmailService>;
  let logger: jest.Mocked<LogService>;

  beforeEach(async () => {
    const mockAuthService = {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
    };

    const mockUsersService = {
      create: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
    };

    const mockSessionService = {
      createSession: jest.fn(),
      validateSession: jest.fn(),
    };

    const mockReferralService = {
      applyReferral: jest.fn(),
      acceptReferral: jest.fn(),
      createReferralCode: jest.fn(),
      getReferralByCode: jest.fn(),
    };

    const mockEmailVerificationService = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    const mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupHandler,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: SessionsService,
          useValue: mockSessionService,
        },
        {
          provide: ReferralService,
          useValue: mockReferralService,
        },
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: 'Logger',
          useValue: mockLogger,
        },
      ],
    }).compile();

    handler = module.get<SignupHandler>(SignupHandler);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    sessionService = module.get(SessionsService);
    emailService = module.get(EmailService);
    logger = module.get('Logger');
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockHashedPassword = 'hashed-password';
    const mockUserId = 'user-id';
    const mockSessionId = 'session-id';

    beforeEach(() => {
      // Mock bcrypt.hash
      jest
        .spyOn(require('bcrypt'), 'hash')
        .mockResolvedValue(mockHashedPassword);

      // Mock environment variable
      process.env.KEY_AUTHENTICATION = 'test-key';

      // Par défaut : email n'existe pas (nouveau signup)
      usersService.findOne.mockResolvedValue(null);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create user and session successfully', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        phoneNumber: null,
        isEmailVerified: false,
        authType: AuthType.EMAIL,
        linkedinId: null,
        googleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        id: 'session-id',
        sessionId: mockSessionId,
        userId: mockUserId,
        token: 'session-token',
        fingerprint: 'fingerprint',
        isRevoked: false,
        lastUsage: new Date(),
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.create.mockResolvedValue(mockUser as any);
      sessionService.createSession.mockResolvedValue(mockSession as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        email: mockEmail,
        password: mockPassword,
      });

      // Assert
      expect(result).toEqual({
        sessionId: mockSessionId,
        setCookie: true,
      });

      expect(usersService.create).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: {
          email: mockEmail,
          password: mockHashedPassword,
          authType: AuthType.EMAIL,
          isEmailVerified: false,
        },
      });

      expect(sessionService.createSession).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: expect.objectContaining({
          userId: mockUserId,
        }),
      });
    });

    it('should handle email already exists error', async () => {
      // Arrange
      const mockError = new AuthenticationEmailAlreadyExistException(
        logger,
        { transactionId: mockTransactionId },
        'Email already exists',
      );

      usersService.create.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: mockEmail,
          password: mockPassword,
        }),
      ).rejects.toThrow(AuthenticationEmailAlreadyExistException);
    });

    it('should handle general user creation error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      usersService.create.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: mockEmail,
          password: mockPassword,
        }),
      ).rejects.toThrow();
    });

    it('should handle session creation error', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        phoneNumber: null,
        isEmailVerified: false,
        authType: AuthType.EMAIL,
        linkedinId: null,
        googleId: null,
        lastSignupAttemptAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockError = new Error('Session creation failed');
      usersService.create.mockResolvedValue(mockUser);
      sessionService.createSession.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: mockEmail,
          password: mockPassword,
        }),
      ).rejects.toThrow();

      expect(usersService.create).toHaveBeenCalled();
      expect(sessionService.createSession).toHaveBeenCalled();
    });

    it('should hash password with correct parameters', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        authType: AuthType.EMAIL,
        isEmailVerified: false,
      };

      const mockSession = {
        sessionId: mockSessionId,
        userId: mockUserId,
      };

      usersService.create.mockResolvedValue(mockUser as any);
      sessionService.createSession.mockResolvedValue(mockSession as any);

      const bcryptHashSpy = jest.spyOn(require('bcrypt'), 'hash');

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        email: mockEmail,
        password: mockPassword,
      });

      // Assert — saltRounds = 1 in test env (NODE_ENV === 'test')
      const expectedSaltRounds = process.env.NODE_ENV === 'test' ? 1 : 15;
      expect(bcryptHashSpy).toHaveBeenCalledWith(
        `${mockPassword}${process.env.KEY_AUTHENTICATION}`,
        expectedSaltRounds,
      );
    });

    it('should log execution start and end', async () => {
      // Arrange
      const mockUser = {
        id: mockUserId,
        email: mockEmail,
        password: mockHashedPassword,
        phoneNumber: null,
        isEmailVerified: false,
        authType: AuthType.EMAIL,
        linkedinId: null,
        googleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        id: 'session-id',
        sessionId: mockSessionId,
        userId: mockUserId,
        token: 'session-token',
        fingerprint: 'fingerprint',
        isRevoked: false,
        lastUsage: new Date(),
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.create.mockResolvedValue(mockUser as any);
      sessionService.createSession.mockResolvedValue(mockSession as any);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        email: mockEmail,
        password: mockPassword,
      });

      // Assert
    });

    it('should handle empty email', async () => {
      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: '',
          password: mockPassword,
        }),
      ).rejects.toThrow();
    });

    it('should handle empty password', async () => {
      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          email: mockEmail,
          password: '',
        }),
      ).rejects.toThrow();
    });

    it('should create session and set cookie when email already exists (scénario 2)', async () => {
      const mockExistingUser = {
        id: mockUserId,
        email: mockEmail,
        isEmailVerified: true,
        lastSignupAttemptAt: null,
      };

      const mockSession = {
        sessionId: mockSessionId,
        userId: mockUserId,
      };

      usersService.findOne.mockResolvedValue(mockExistingUser as any);
      usersService.create.mockClear();
      sessionService.createSession.mockResolvedValue(mockSession as any);

      const result = await handler.execute({
        transactionId: mockTransactionId,
        email: mockEmail,
        password: mockPassword,
      });

      expect(result.sessionId).toBe(mockSessionId);
      expect(result.setCookie).toBe(true);
      expect(usersService.create).not.toHaveBeenCalled();
      expect(sessionService.createSession).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: expect.objectContaining({
          userId: mockUserId,
          isOtpOnlySession: true,
          expiresAt: expect.any(Date),
        }),
      });
    });

    it('should send security email and update lastSignupAttemptAt when existing email and no recent attempt', async () => {
      const mockExistingUser = {
        id: mockUserId,
        email: mockEmail,
        isEmailVerified: true,
        lastSignupAttemptAt: null,
      };

      const mockSession = { sessionId: mockSessionId, userId: mockUserId };
      usersService.findOne.mockResolvedValue(mockExistingUser as any);
      sessionService.createSession.mockResolvedValue(mockSession as any);

      await handler.execute({
        transactionId: mockTransactionId,
        email: mockEmail,
        password: mockPassword,
      });

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockEmail,
          type: 'signup-existing-account',
        }),
      );
      expect(usersService.update).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockUserId },
        data: { lastSignupAttemptAt: expect.any(Date) },
      });
    });

    it('should NOT send security email when existing email and lastSignupAttemptAt < 1h', async () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const mockExistingUser = {
        id: mockUserId,
        email: mockEmail,
        isEmailVerified: true,
        lastSignupAttemptAt: oneMinuteAgo,
      };

      const mockSession = { sessionId: mockSessionId, userId: mockUserId };
      usersService.findOne.mockResolvedValue(mockExistingUser as any);
      sessionService.createSession.mockResolvedValue(mockSession as any);

      await handler.execute({
        transactionId: mockTransactionId,
        email: mockEmail,
        password: mockPassword,
      });

      expect(emailService.sendEmail).not.toHaveBeenCalled();
      expect(usersService.update).not.toHaveBeenCalled();
    });
  });
});
