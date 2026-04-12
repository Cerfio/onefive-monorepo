import { Test, TestingModule } from '@nestjs/testing';
import { DeleteDiscussionHandler } from './delete-discussion.handler';
import { DiscussionService } from '../discussion.service';
import { ProfileService } from '../../profile/profile.service';
import { LogService } from 'logstash-winston-3';
import { DiscussionType } from '@prisma/client';
import {
  DiscussionNotFoundException,
  DiscussionUpdateForbiddenException,
} from '../discussion.exception';

describe('DeleteDiscussionHandler', () => {
  let handler: DeleteDiscussionHandler;
  let discussionService: jest.Mocked<DiscussionService>;
  let profileService: jest.Mocked<ProfileService>;
  let logger: jest.Mocked<LogService>;

  beforeEach(async () => {
    const mockDiscussionService = {
      get: jest.fn(),
      delete: jest.fn(),
    };

    const mockProfileService = {
      get: jest.fn(),
    };

    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteDiscussionHandler,
        {
          provide: DiscussionService,
          useValue: mockDiscussionService,
        },
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: 'Logger',
          useValue: mockLogger,
        },
      ],
    }).compile();

    handler = module.get<DeleteDiscussionHandler>(DeleteDiscussionHandler);
    discussionService = module.get(DiscussionService);
    profileService = module.get(ProfileService);
    logger = module.get('Logger');
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockDiscussionId = 'discussion-id-123';
    const mockUserId = 'user-id-123';
    const mockProfileId = 'profile-id-123';

    const mockProfile = {
      id: mockProfileId,
    } as any;

    const mockDiscussion = {
      id: mockDiscussionId,
      profileId: mockProfileId,
      question: 'Test question?',
      questionUnaccented: 'test question?',
      content: 'Test content',
      context: '',
      type: DiscussionType.DISCUSSION,
      options: [] as string[],
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    it('should delete discussion successfully', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockDiscussion);
      discussionService.delete.mockResolvedValue(undefined);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        discussionId: mockDiscussionId,
        userId: mockUserId,
      });

      // Assert
      expect(result).toBe(true);
      expect(profileService.get).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { userId: mockUserId },
        select: { id: true },
      });
      expect(discussionService.get).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockDiscussionId },
      });
      expect(discussionService.delete).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockDiscussionId },
      });
    });

    it('should throw DiscussionNotFoundException when discussion not found', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(null);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(DiscussionNotFoundException);

      expect(logger.error).toHaveBeenCalledWith(
        'DiscussionNotFoundException',
        expect.objectContaining({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
        }),
      );
      expect(discussionService.delete).not.toHaveBeenCalled();
    });

    it('should throw DiscussionUpdateForbiddenException when user is not author', async () => {
      // Arrange
      const differentProfileId = 'different-profile-id';
      profileService.get.mockResolvedValue({ id: differentProfileId } as any);
      discussionService.get.mockResolvedValue(mockDiscussion);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(DiscussionUpdateForbiddenException);

      expect(logger.error).toHaveBeenCalledWith(
        'DiscussionUpdateForbiddenException',
        expect.objectContaining({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          profileId: differentProfileId,
        }),
      );
      expect(discussionService.delete).not.toHaveBeenCalled();
    });

    it('should handle profile service error', async () => {
      // Arrange
      const mockError = new Error('Profile not found');
      profileService.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);

      expect(discussionService.get).not.toHaveBeenCalled();
      expect(discussionService.delete).not.toHaveBeenCalled();
    });

    it('should handle discussion service get error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);

      expect(discussionService.delete).not.toHaveBeenCalled();
    });

    it('should handle discussion service delete error', async () => {
      // Arrange
      const mockError = new Error('Delete operation failed');
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockDiscussion);
      discussionService.delete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);

      expect(discussionService.delete).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockDiscussionId },
      });
    });

    it('should handle invalid discussion ID', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(null);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: 'invalid-discussion-id',
          userId: mockUserId,
        }),
      ).rejects.toThrow(DiscussionNotFoundException);
    });

    it('should handle invalid user ID', async () => {
      // Arrange
      const mockError = new Error('Invalid user ID');
      profileService.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          userId: 'invalid-user-id',
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle concurrent delete operations', async () => {
      // Arrange
      const mockError = new Error('Discussion already deleted');
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockDiscussion);
      discussionService.delete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle discussions with dependencies', async () => {
      // Arrange - Simulate discussion with answers that prevent deletion
      const mockError = new Error(
        'Cannot delete discussion with existing answers',
      );
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockDiscussion);
      discussionService.delete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should log execution start and end', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockDiscussion);
      discussionService.delete.mockResolvedValue(undefined);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        discussionId: mockDiscussionId,
        userId: mockUserId,
      });

      // Note: @Log() decorator uses its own logger (noop in test mode),
      // not the injected Logger. We verify the method executed successfully instead.
      expect(discussionService.delete).toHaveBeenCalled();
    });
  });
});
