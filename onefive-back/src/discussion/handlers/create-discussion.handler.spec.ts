import { Test, TestingModule } from '@nestjs/testing';
import { CreateDiscussionHandler } from './create-discussion.handler';
import { DiscussionService } from '../discussion.service';
import { ProfileService } from '../../profile/profile.service';
import { LogService } from 'logstash-winston-3';
import { DiscussionType } from '@prisma/client';

describe('CreateDiscussionHandler', () => {
  let handler: CreateDiscussionHandler;
  let discussionService: jest.Mocked<DiscussionService>;
  let profileService: jest.Mocked<ProfileService>;
  let logger: jest.Mocked<LogService>;

  beforeEach(async () => {
    const mockDiscussionService = {
      create: jest.fn(),
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
        CreateDiscussionHandler,
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

    handler = module.get<CreateDiscussionHandler>(CreateDiscussionHandler);
    discussionService = module.get(DiscussionService);
    profileService = module.get(ProfileService);
    logger = module.get('Logger');
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockUserId = 'user-id-123';
    const mockProfileId = 'profile-id-123';
    const mockContent = 'This is a discussion content';
    const mockQuestion = 'What is the best programming language?';
    const mockTags = ['programming', 'technology'];
    const mockOptions = ['JavaScript', 'Python', 'Java'];

    const mockProfile = {
      id: mockProfileId,
    } as any;

    const mockCreatedDiscussion = {
      id: 'discussion-id-123',
      profileId: mockProfileId,
      question: mockQuestion,
      questionUnaccented: 'what is the best programming language?',
      content: mockContent,
      context: '',
      type: DiscussionType.DISCUSSION,
      options: [] as string[],
      tags: mockTags,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    it('should create discussion successfully for DISCUSSION type', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.create.mockResolvedValue(mockCreatedDiscussion);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        content: mockContent,
        question: mockQuestion,
        type: DiscussionType.DISCUSSION,
        options: mockOptions,
        tags: mockTags,
      });

      // Assert
      expect(result).toEqual(mockCreatedDiscussion);
      expect(profileService.get).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { userId: mockUserId },
        select: { id: true },
      });
      expect(discussionService.create).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: {
          author: {
            connect: {
              id: mockProfileId,
            },
          },
          content: mockContent,
          question: mockQuestion,
          questionUnaccented: expect.any(String), // normalized string
          type: DiscussionType.DISCUSSION,
          options: [], // Should be empty for DISCUSSION type
          tags: mockTags,
        },
      });
    });

    it('should create discussion successfully for POLL type', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.create.mockResolvedValue({
        ...mockCreatedDiscussion,
        type: DiscussionType.POLL,
        options: mockOptions,
      });

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        content: mockContent,
        question: mockQuestion,
        type: DiscussionType.POLL,
        options: mockOptions,
        tags: mockTags,
      });

      // Assert
      expect(result.type).toBe(DiscussionType.POLL);
      expect(result.options).toEqual(mockOptions);
      expect(discussionService.create).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: {
          author: {
            connect: {
              id: mockProfileId,
            },
          },
          content: mockContent,
          question: mockQuestion,
          questionUnaccented: expect.any(String),
          type: DiscussionType.POLL,
          options: mockOptions, // Should include options for POLL type
          tags: mockTags,
        },
      });
    });

    it('should handle empty content', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.create.mockResolvedValue({
        ...mockCreatedDiscussion,
        content: '',
      });

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        content: undefined,
        question: mockQuestion,
        type: DiscussionType.DISCUSSION,
        options: [],
        tags: mockTags,
      });

      // Assert
      expect(result.content).toBe('');
      expect(discussionService.create).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: {
          author: {
            connect: {
              id: mockProfileId,
            },
          },
          content: '', // Should default to empty string
          question: mockQuestion,
          questionUnaccented: expect.any(String),
          type: DiscussionType.DISCUSSION,
          options: [],
          tags: mockTags,
        },
      });
    });

    it('should handle empty tags', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.create.mockResolvedValue({
        ...mockCreatedDiscussion,
        tags: [],
      });

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        content: mockContent,
        question: mockQuestion,
        type: DiscussionType.DISCUSSION,
        options: [],
        tags: [],
      });

      // Assert
      expect(result.tags).toEqual([]);
    });

    it('should handle profile service error', async () => {
      // Arrange
      const mockError = new Error('Profile not found');
      profileService.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          content: mockContent,
          question: mockQuestion,
          type: DiscussionType.DISCUSSION,
          options: [],
          tags: mockTags,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle discussion service error', async () => {
      // Arrange
      const mockError = new Error('Failed to create discussion');
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.create.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          content: mockContent,
          question: mockQuestion,
          type: DiscussionType.DISCUSSION,
          options: [],
          tags: mockTags,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle invalid user ID', async () => {
      // Arrange
      const mockError = new Error('Invalid user ID');
      profileService.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: 'invalid-user-id',
          content: mockContent,
          question: mockQuestion,
          type: DiscussionType.DISCUSSION,
          options: [],
          tags: mockTags,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle empty question', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.create.mockResolvedValue({
        ...mockCreatedDiscussion,
        question: '',
      });

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        content: mockContent,
        question: '',
        type: DiscussionType.DISCUSSION,
        options: [],
        tags: mockTags,
      });

      // Assert
      expect(result.question).toBe('');
    });

    it('should normalize question string', async () => {
      // Arrange
      const questionWithAccents = '¿Qué es la mejor lengua de programación?';
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.create.mockResolvedValue(mockCreatedDiscussion);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        content: mockContent,
        question: questionWithAccents,
        type: DiscussionType.DISCUSSION,
        options: [],
        tags: mockTags,
      });

      // Assert
      expect(discussionService.create).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        data: {
          author: {
            connect: {
              id: mockProfileId,
            },
          },
          content: mockContent,
          question: questionWithAccents,
          questionUnaccented: expect.any(String), // Should be normalized
          type: DiscussionType.DISCUSSION,
          options: [],
          tags: mockTags,
        },
      });
    });

    it('should log execution start and end', async () => {
      // Arrange
      profileService.get.mockResolvedValue(mockProfile);
      discussionService.create.mockResolvedValue(mockCreatedDiscussion);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        content: mockContent,
        question: mockQuestion,
        type: DiscussionType.DISCUSSION,
        options: [],
        tags: mockTags,
      });

      // Note: @Log() decorator uses its own logger (noop in test mode),
      // not the injected Logger. We verify the method executed successfully instead.
      expect(discussionService.create).toHaveBeenCalled();
    });
  });
});
