import { Test, TestingModule } from '@nestjs/testing';
import { EmailConfirmHandler } from './email-confirm.handler';
import { EmailVerificationService } from '../../email-verification/email-verification.service';

describe('EmailConfirmHandler', () => {
  let handler: EmailConfirmHandler;
  let emailVerificationService: jest.Mocked<EmailVerificationService>;

  beforeEach(async () => {
    const mockEmailVerificationService = {
      confirmEmailVerification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailConfirmHandler,
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
      ],
    }).compile();

    handler = module.get<EmailConfirmHandler>(EmailConfirmHandler);
    emailVerificationService = module.get(EmailVerificationService);
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockUserId = 'user-id-123';
    const mockCode = '123456';
    const mockResult = {
      success: true,
      message: 'Email verified successfully',
    };

    it('should confirm email verification successfully', async () => {
      // Arrange
      emailVerificationService.confirmEmailVerification.mockResolvedValue(
        mockResult,
      );

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        code: mockCode,
      });

      // Assert
      expect(result).toEqual(mockResult);
      expect(
        emailVerificationService.confirmEmailVerification,
      ).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        userId: mockUserId,
        code: mockCode,
      });
    });

    it('should handle email verification service errors', async () => {
      // Arrange
      const mockError = new Error('Invalid verification code');
      emailVerificationService.confirmEmailVerification.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          code: mockCode,
        }),
      ).rejects.toThrow(mockError);

      expect(
        emailVerificationService.confirmEmailVerification,
      ).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        userId: mockUserId,
        code: mockCode,
      });
    });

    it('should handle empty code', async () => {
      // Arrange
      const mockError = new Error('Code is required');
      emailVerificationService.confirmEmailVerification.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          code: '',
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle invalid userId', async () => {
      // Arrange
      const mockError = new Error('Invalid user ID');
      emailVerificationService.confirmEmailVerification.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: 'invalid-user-id',
          code: mockCode,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle expired verification code', async () => {
      // Arrange
      const mockError = new Error('Verification code has expired');
      emailVerificationService.confirmEmailVerification.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          code: 'expired-code',
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle already verified email', async () => {
      // Arrange
      const mockResult = {
        success: false,
        message: 'Email is already verified',
      };
      emailVerificationService.confirmEmailVerification.mockResolvedValue(
        mockResult,
      );

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        code: mockCode,
      });

      // Assert
      expect(result).toEqual(mockResult);
    });
  });
});
