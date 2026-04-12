import { Test, TestingModule } from '@nestjs/testing';
import { EmailRequestHandler } from './email-request.handler';
import { EmailVerificationService } from '../../email-verification/email-verification.service';

describe('EmailRequestHandler', () => {
  let handler: EmailRequestHandler;
  let emailVerificationService: jest.Mocked<EmailVerificationService>;

  beforeEach(async () => {
    const mockEmailVerificationService = {
      requestEmailVerification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailRequestHandler,
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
      ],
    }).compile();

    handler = module.get<EmailRequestHandler>(EmailRequestHandler);
    emailVerificationService = module.get(EmailVerificationService);
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockUserId = 'user-id-123';
    const mockResult = {
      success: true,
      message: 'Verification code sent successfully',
      codeId: 'code-id-123',
    };

    it('should request email verification successfully', async () => {
      // Arrange
      emailVerificationService.requestEmailVerification.mockResolvedValue(
        mockResult,
      );

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
      });

      // Assert
      expect(result).toEqual(mockResult);
      expect(
        emailVerificationService.requestEmailVerification,
      ).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        userId: mockUserId,
        isOtpOnlySession: false,
      });
    });

    it('should handle email verification service errors', async () => {
      // Arrange
      const mockError = new Error('Failed to send verification email');
      emailVerificationService.requestEmailVerification.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);

      expect(
        emailVerificationService.requestEmailVerification,
      ).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        userId: mockUserId,
        isOtpOnlySession: false,
      });
    });

    it('should handle rate limiting error', async () => {
      // Arrange
      const mockError = new Error('Too many requests, please try again later');
      emailVerificationService.requestEmailVerification.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle invalid user ID', async () => {
      // Arrange
      const mockError = new Error('Invalid user ID');
      emailVerificationService.requestEmailVerification.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: 'invalid-user-id',
        }),
      ).rejects.toThrow(mockError);
    });

    it('should return success when email is already verified (no OTP sent)', async () => {
      emailVerificationService.requestEmailVerification.mockResolvedValue({
        success: true,
        message: 'Verification email sent',
      });

      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
      });

      expect(result.success).toBe(true);
      expect(
        emailVerificationService.requestEmailVerification,
      ).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        userId: mockUserId,
        isOtpOnlySession: false,
      });
    });

    it('should handle email service unavailable', async () => {
      // Arrange
      const mockError = new Error('Email service is temporarily unavailable');
      emailVerificationService.requestEmailVerification.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle empty userId', async () => {
      // Arrange
      const mockError = new Error('User ID is required');
      emailVerificationService.requestEmailVerification.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: '',
        }),
      ).rejects.toThrow(mockError);
    });
  });
});
