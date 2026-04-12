import { Test, TestingModule } from '@nestjs/testing';
import { EmailHasVerifiedHandler } from './email-has-verified.handler';
import { EmailVerificationService } from '../../email-verification/email-verification.service';

describe('EmailHasVerifiedHandler', () => {
  let handler: EmailHasVerifiedHandler;
  let emailVerificationService: jest.Mocked<EmailVerificationService>;

  beforeEach(async () => {
    const mockEmailVerificationService = {
      checkEmailVerificationStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailHasVerifiedHandler,
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
      ],
    }).compile();

    handler = module.get<EmailHasVerifiedHandler>(EmailHasVerifiedHandler);
    emailVerificationService = module.get(EmailVerificationService);
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockUserId = 'user-id-123';
    const mockEmail = 'test@example.com';

    it('should return email verification status when verified', async () => {
      // Arrange
      const mockServiceResult = {
        email: mockEmail,
        isVerified: true,
      };
      emailVerificationService.checkEmailVerificationStatus.mockResolvedValue(
        mockServiceResult,
      );

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
      });

      // Assert
      expect(result).toEqual({
        email: mockEmail,
        isVerified: true,
      });
      expect(
        emailVerificationService.checkEmailVerificationStatus,
      ).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        userId: mockUserId,
      });
    });

    it('should return email verification status when not verified', async () => {
      // Arrange
      const mockServiceResult = {
        email: mockEmail,
        isVerified: false,
      };
      emailVerificationService.checkEmailVerificationStatus.mockResolvedValue(
        mockServiceResult,
      );

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
      });

      // Assert
      expect(result).toEqual({
        email: mockEmail,
        isVerified: false,
      });
    });

    it('should handle email verification service errors', async () => {
      // Arrange
      const mockError = new Error('Failed to check email verification status');
      emailVerificationService.checkEmailVerificationStatus.mockRejectedValue(
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
        emailVerificationService.checkEmailVerificationStatus,
      ).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        userId: mockUserId,
      });
    });

    it('should handle invalid user ID', async () => {
      // Arrange
      const mockError = new Error('Invalid user ID');
      emailVerificationService.checkEmailVerificationStatus.mockRejectedValue(
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

    it('should handle empty userId', async () => {
      // Arrange
      const mockError = new Error('User ID is required');
      emailVerificationService.checkEmailVerificationStatus.mockRejectedValue(
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

    it('should handle database connection error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      emailVerificationService.checkEmailVerificationStatus.mockRejectedValue(
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

    it('should handle user not found', async () => {
      // Arrange
      const mockError = new Error('User not found');
      emailVerificationService.checkEmailVerificationStatus.mockRejectedValue(
        mockError,
      );

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: 'nonexistent-user-id',
        }),
      ).rejects.toThrow(mockError);
    });

    it('should correctly map service response', async () => {
      // Arrange
      const mockServiceResult = {
        email: 'different@example.com',
        isVerified: true,
      };
      emailVerificationService.checkEmailVerificationStatus.mockResolvedValue(
        mockServiceResult,
      );

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
      });

      // Assert
      expect(result).toEqual({
        email: 'different@example.com',
        isVerified: true,
      });
      expect(result.email).toBe(mockServiceResult.email);
      expect(result.isVerified).toBe(mockServiceResult.isVerified);
    });
  });
});
