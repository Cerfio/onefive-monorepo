import { Test, TestingModule } from '@nestjs/testing';
import { ListDiscussionHandler } from './list-discussion.handler';
import { DiscussionService } from '../discussion.service';
import { ProfileService } from '../../profile/profile.service';
import { ProfileFollowService } from '../../profile-follow/profile-follow.service';
import { StorageService } from '../../storage/storage.service';
import { StreakService } from '../../streak/streak.service';
import { LogService } from 'logstash-winston-3';

describe('ListDiscussionHandler', () => {
  let handler: ListDiscussionHandler;
  let discussionService: jest.Mocked<DiscussionService>;
  let profileService: jest.Mocked<ProfileService>;
  let logger: jest.Mocked<LogService>;

  beforeEach(async () => {
    const mockDiscussionService = {
      list: jest.fn(),
    };

    const mockProfileService = {
      get: jest.fn(),
      list: jest.fn(),
    };

    const mockProfileFollowService = {
      isFollowing: jest.fn().mockResolvedValue(false),
      areFollowingBatch: jest.fn().mockResolvedValue(new Set()),
    };

    const mockStorageService = {
      getSignedUrl: jest.fn(),
    };

    const mockStreakService = {
      getCurrentStreak: jest.fn().mockResolvedValue(0),
      getCurrentStreakBatch: jest.fn().mockResolvedValue(new Map()),
    };

    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListDiscussionHandler,
        {
          provide: DiscussionService,
          useValue: mockDiscussionService,
        },
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: ProfileFollowService,
          useValue: mockProfileFollowService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: StreakService,
          useValue: mockStreakService,
        },
        {
          provide: 'Logger',
          useValue: mockLogger,
        },
      ],
    }).compile();

    handler = module.get<ListDiscussionHandler>(ListDiscussionHandler);
    discussionService = module.get(DiscussionService);
    profileService = module.get(ProfileService);
    logger = module.get('Logger');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const mockTransactionId = 'transaction-123';
    const mockUserId = 'user-id-123';
    const mockCurrentProfile = { id: 'current-profile-id' } as any;

    it('should list discussions successfully with default sorting', async () => {
      // Arrange
      const mockDiscussions = [
        {
          id: 'discussion-1',
          profileId: 'profile-123',
          content: 'Discussion content 1',
          options: ['opt1'],
          question: 'Question 1?',
          type: 'poll',
          tags: ['tag1'],
          createdAt: new Date(),
          updatedAt: new Date(),
          reactions: [{ profileId: 'profile-456', reaction: '👍' }],
          _count: { views: 10, upvotes: 5, answers: 2 },
        },
        {
          id: 'discussion-2',
          profileId: 'profile-789',
          content: 'Discussion content 2',
          options: [],
          question: 'Question 2?',
          type: 'text',
          tags: ['tag2'],
          createdAt: new Date(),
          updatedAt: new Date(),
          reactions: [],
          _count: { views: 5, upvotes: 1, answers: 0 },
        },
      ];

      const mockProfiles = [
        {
          id: 'profile-123',
          firstName: 'John',
          lastName: 'Doe',
          createdAt: new Date(),
          bio: 'Bio1',
          _count: { followedBy: 100 },
        },
        {
          id: 'profile-789',
          firstName: 'Jane',
          lastName: 'Smith',
          createdAt: new Date(),
          bio: 'Bio2',
          _count: { followedBy: 50 },
        },
      ];

      (profileService.get as jest.Mock).mockResolvedValue(mockCurrentProfile);
      discussionService.list.mockResolvedValue(mockDiscussions as any);
      profileService.list.mockResolvedValue(mockProfiles as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        limit: 10,
        offset: 0,
      });

      // Assert
      expect(discussionService.list).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });

      expect(profileService.list).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: { in: ['profile-123', 'profile-789'] } },
        select: expect.any(Object),
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'discussion-1',
        question: 'Question 1?',
        content: 'Discussion content 1',
        upvoteCount: 5,
        answerCount: 2,
        viewCount: 10,
        profile: {
          id: 'profile-123',
          firstName: 'John',
          lastName: 'Doe',
          followedBy: 100,
        },
      });
    });

    it('should filter by tag', async () => {
      // Arrange
      const mockDiscussions = [
        {
          id: 'discussion-1',
          profileId: 'profile-123',
          content: 'Tagged discussion',
          options: [],
          question: 'Question?',
          type: 'text',
          tags: ['javascript'],
          createdAt: new Date(),
          updatedAt: new Date(),
          reactions: [],
          _count: { views: 1, upvotes: 0, answers: 0 },
        },
      ];

      const mockProfiles = [
        {
          id: 'profile-123',
          firstName: 'John',
          lastName: 'Doe',
          createdAt: new Date(),
          bio: 'Bio',
          _count: { followedBy: 10 },
        },
      ];

      (profileService.get as jest.Mock).mockResolvedValue(mockCurrentProfile);
      discussionService.list.mockResolvedValue(mockDiscussions as any);
      profileService.list.mockResolvedValue(mockProfiles as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        limit: 10,
        offset: 0,
        tag: 'javascript',
      });

      // Assert
      expect(discussionService.list).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { tags: { has: 'javascript' } },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });

      expect(result[0].tags).toContain('javascript');
    });

    it('should filter by search query', async () => {
      // Arrange
      const mockDiscussions = [
        {
          id: 'discussion-1',
          profileId: 'profile-123',
          content: 'Search result content',
          options: [],
          question: 'Search question?',
          type: 'text',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          reactions: [],
          _count: { views: 1, upvotes: 0, answers: 0 },
        },
      ];

      const mockProfiles = [
        {
          id: 'profile-123',
          firstName: 'John',
          lastName: 'Doe',
          createdAt: new Date(),
          bio: 'Bio',
          _count: { followedBy: 10 },
        },
      ];

      (profileService.get as jest.Mock).mockResolvedValue(mockCurrentProfile);
      discussionService.list.mockResolvedValue(mockDiscussions as any);
      profileService.list.mockResolvedValue(mockProfiles as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        limit: 10,
        offset: 0,
        search: 'search query',
      });

      // Assert
      expect(discussionService.list).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: {
          OR: [
            {
              questionUnaccented: {
                contains: 'search&query',
                mode: 'insensitive',
              },
            },
            { content: { contains: 'search&query', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });
    });

    it('should sort by most upvoted', async () => {
      // Arrange
      const mockDiscussions = [
        {
          id: 'discussion-1',
          profileId: 'profile-123',
          content: 'Popular discussion',
          options: [],
          question: 'Question?',
          type: 'text',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          reactions: [],
          _count: { views: 100, upvotes: 50, answers: 10 },
        },
      ];

      const mockProfiles = [
        {
          id: 'profile-123',
          firstName: 'John',
          lastName: 'Doe',
          createdAt: new Date(),
          bio: 'Bio',
          _count: { followedBy: 10 },
        },
      ];

      (profileService.get as jest.Mock).mockResolvedValue(mockCurrentProfile);
      discussionService.list.mockResolvedValue(mockDiscussions as any);
      profileService.list.mockResolvedValue(mockProfiles as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        limit: 10,
        offset: 0,
        sort: 'MOST_UPVOTED',
      });

      // Assert
      expect(discussionService.list).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: {},
        orderBy: { upvotes: { _count: 'desc' } },
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });
    });

    it('should sort by most answered', async () => {
      // Arrange
      (profileService.get as jest.Mock).mockResolvedValue(mockCurrentProfile);
      discussionService.list.mockResolvedValue([]);
      profileService.list.mockResolvedValue([]);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        limit: 10,
        offset: 0,
        sort: 'MOST_ANSWERED',
      });

      // Assert
      expect(discussionService.list).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: {},
        orderBy: { answers: { _count: 'desc' } },
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });
    });

    it('should sort by most viewed', async () => {
      // Arrange
      (profileService.get as jest.Mock).mockResolvedValue(mockCurrentProfile);
      discussionService.list.mockResolvedValue([]);
      profileService.list.mockResolvedValue([]);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        limit: 10,
        offset: 0,
        sort: 'MOST_VIEWED',
      });

      // Assert
      expect(discussionService.list).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: {},
        orderBy: { views: { _count: 'desc' } },
        skip: 0,
        take: 10,
        select: expect.any(Object),
      });
    });

    it('should return empty array when no discussions found', async () => {
      // Arrange
      (profileService.get as jest.Mock).mockResolvedValue(mockCurrentProfile);
      discussionService.list.mockResolvedValue([]);
      // profileService.list not called when discussions.length === 0

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        limit: 10,
        offset: 0,
      });

      // Assert
      expect(result).toEqual([]);
      expect(profileService.list).not.toHaveBeenCalled();
    });

    it('should handle offset and limit correctly', async () => {
      // Arrange
      (profileService.get as jest.Mock).mockResolvedValue(mockCurrentProfile);
      discussionService.list.mockResolvedValue([]);
      profileService.list.mockResolvedValue([]);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        userId: mockUserId,
        limit: 5,
        offset: 20,
      });

      // Assert
      expect(discussionService.list).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 20,
        take: 5,
        select: expect.any(Object),
      });
    });

    it('should handle discussion service error', async () => {
      // Arrange
      (profileService.get as jest.Mock).mockResolvedValue(mockCurrentProfile);
      const discussionError = new Error('Discussion list failed');
      discussionService.list.mockRejectedValue(discussionError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          limit: 10,
          offset: 0,
        }),
      ).rejects.toThrow('Discussion list failed');

      expect(profileService.list).not.toHaveBeenCalled();
    });

    it('should handle profile service error', async () => {
      // Arrange
      const mockDiscussions = [
        {
          id: 'discussion-1',
          profileId: 'profile-123',
          content: 'Content',
          options: [],
          question: 'Question?',
          type: 'text',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          reactions: [],
          _count: { views: 1, upvotes: 0, answers: 0 },
        },
      ];

      const profileError = new Error('Profile list failed');

      (profileService.get as jest.Mock).mockResolvedValue(mockCurrentProfile);
      discussionService.list.mockResolvedValue(mockDiscussions as any);
      profileService.list.mockRejectedValue(profileError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          userId: mockUserId,
          limit: 10,
          offset: 0,
        }),
      ).rejects.toThrow('Profile list failed');
    });
  });
});
