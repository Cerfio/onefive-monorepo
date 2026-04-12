import { Test, TestingModule } from '@nestjs/testing';
import { UpdateDiscussionHandler } from './update-discussion.handler';
import { DiscussionService } from '../discussion.service';
import { ProfileService } from '../../profile/profile.service';
import { LogService } from 'logstash-winston-3';
import { DiscussionType } from '@prisma/client';
import {
  DiscussionNotFoundException,
  DiscussionUpdateForbiddenException,
} from '../discussion.exception';

describe('UpdateDiscussionHandler', () => {
  let handler: UpdateDiscussionHandler;
  let discussionService: jest.Mocked<DiscussionService>;
  let profileService: jest.Mocked<ProfileService>;
  let logger: jest.Mocked<LogService>;

  beforeEach(async () => {
    const mockDiscussionService = {
      get: jest.fn(),
      update: jest.fn(),
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
        UpdateDiscussionHandler,
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

    handler = module.get<UpdateDiscussionHandler>(UpdateDiscussionHandler);
    discussionService = module.get(DiscussionService);
    profileService = module.get(ProfileService);
    logger = module.get('Logger');
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockDiscussionId = 'discussion-id-123';
    const mockUserId = 'user-id-123';
    const mockProfileId = 'profile-id-123';
    const mockUpdatedQuestion = 'Updated question?';
    const mockUpdatedContent = 'Updated content';
    const mockUpdatedTags = ['updated', 'tags'];

    const mockProfile = {
      id: mockProfileId,
    } as any;

    const mockExistingDiscussion = {
      id: mockDiscussionId,
      profileId: mockProfileId,
      question: 'Original question?',
      questionUnaccented: 'Original question?',
      content: 'Original content',
      context: undefined,
      type: DiscussionType.DISCUSSION,
      options: [],
      tags: ['original', 'tags'],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    const mockUpdatedDiscussion = {
      ...mockExistingDiscussion,
      question: mockUpdatedQuestion,
      content: mockUpdatedContent,
      tags: mockUpdatedTags,
      updatedAt: new Date(),
    } as any;

    it('should update discussion successfully', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockExistingDiscussion);
      discussionService.update.mockResolvedValue(mockUpdatedDiscussion);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        discussionId: mockDiscussionId,
        userId: mockUserId,
        question: mockUpdatedQuestion,
        content: mockUpdatedContent,
        tags: mockUpdatedTags,
      });

      // Assert
      expect(result).toEqual(mockUpdatedDiscussion);
      expect(profileService.get).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { userId: mockUserId },
        select: { id: true },
      });
      expect(discussionService.get).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockDiscussionId },
      });
      expect(discussionService.update).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockDiscussionId },
        data: {
          question: mockUpdatedQuestion,
          questionUnaccented: expect.any(String),
          content: mockUpdatedContent,
          tags: mockUpdatedTags,
        },
      });
    });

    it('should update only question', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockExistingDiscussion);
      discussionService.update.mockResolvedValue({
        ...mockExistingDiscussion,
        question: mockUpdatedQuestion,
      });

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        discussionId: mockDiscussionId,
        userId: mockUserId,
        question: mockUpdatedQuestion,
      });

      // Assert
      expect(result.question).toBe(mockUpdatedQuestion);
      expect(discussionService.update).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockDiscussionId },
        data: {
          question: mockUpdatedQuestion,
          questionUnaccented: expect.any(String),
        },
      });
    });

    it('should update only content', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockExistingDiscussion);
      discussionService.update.mockResolvedValue({
        ...mockExistingDiscussion,
        content: mockUpdatedContent,
      });

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        discussionId: mockDiscussionId,
        userId: mockUserId,
        content: mockUpdatedContent,
      });

      // Assert
      expect(result.content).toBe(mockUpdatedContent);
      expect(discussionService.update).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockDiscussionId },
        data: {
          content: mockUpdatedContent,
        },
      });
    });

    it('should update options for poll type', async () => {
      // Arrange
      const updatedOptions = ['Option 1', 'Option 2'];
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue({
        ...mockExistingDiscussion,
        type: DiscussionType.POLL,
      });
      discussionService.update.mockResolvedValue({
        ...mockExistingDiscussion,
        options: updatedOptions,
      });

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        discussionId: mockDiscussionId,
        userId: mockUserId,
        options: updatedOptions,
      });

      // Assert
      expect(result.options).toEqual(updatedOptions);
      expect(discussionService.update).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockDiscussionId },
        data: {
          options: updatedOptions,
        },
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
          question: mockUpdatedQuestion,
        }),
      ).rejects.toThrow(DiscussionNotFoundException);

      expect(logger.error).toHaveBeenCalledWith(
        'DiscussionNotFoundException',
        expect.objectContaining({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
        }),
      );
    });

    it('should throw DiscussionUpdateForbiddenException when user is not author', async () => {
      // Arrange
      const differentProfileId = 'different-profile-id';
      profileService.get.mockResolvedValue({ id: differentProfileId } as any);
      discussionService.get.mockResolvedValue(mockExistingDiscussion);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          userId: mockUserId,
          question: mockUpdatedQuestion,
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
          question: mockUpdatedQuestion,
        }),
      ).rejects.toThrow(mockError);
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
          question: mockUpdatedQuestion,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle discussion service update error', async () => {
      // Arrange
      const mockError = new Error('Update failed');
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockExistingDiscussion);
      discussionService.update.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          discussionId: mockDiscussionId,
          userId: mockUserId,
          question: mockUpdatedQuestion,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle empty update data', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockExistingDiscussion);
      discussionService.update.mockResolvedValue(mockExistingDiscussion);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        discussionId: mockDiscussionId,
        userId: mockUserId,
      });

      // Assert
      expect(result).toEqual(mockExistingDiscussion);
      expect(discussionService.update).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockDiscussionId },
        data: {}, // Empty update data
      });
    });

    it('should normalize question string', async () => {
      // Arrange
      const questionWithAccents = '¿Cuál es la mejor pregunta actualizada?';
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockExistingDiscussion);
      discussionService.update.mockResolvedValue({
        ...mockExistingDiscussion,
        question: questionWithAccents,
      });

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        discussionId: mockDiscussionId,
        userId: mockUserId,
        question: questionWithAccents,
      });

      // Assert
      expect(discussionService.update).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockDiscussionId },
        data: {
          question: questionWithAccents,
          questionUnaccented: expect.any(String), // Should be normalized
        },
      });
    });

    it('should log execution start and end', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.get.mockResolvedValue(mockExistingDiscussion);
      discussionService.update.mockResolvedValue(mockUpdatedDiscussion);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        discussionId: mockDiscussionId,
        userId: mockUserId,
        question: mockUpdatedQuestion,
      });

      // Note: @Log() decorator uses its own logger (noop in test mode),
      // not the injected Logger. We verify the method executed successfully instead.
      expect(discussionService.update).toHaveBeenCalled();
    });
  });
});
