import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from '../profile/profile.service';
import { StreakService } from '../streak/streak.service';
import { StorageService } from '../storage/storage.service';
import { LogService } from 'logstash-winston-3';
import { PostCreateException } from './post.exception';

describe('PostService', () => {
  let service: PostService;
  let prismaService: jest.Mocked<PrismaService>;
  let profileService: jest.Mocked<ProfileService>;
  let logger: jest.Mocked<LogService>;

  beforeEach(async () => {
    const mockPrismaService = {
      post: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const mockProfileService = {
      get: jest.fn(),
    };

    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const mockStreakService = {
      getCurrentStreak: jest.fn().mockResolvedValue({ streak: 0 }),
      incrementStreak: jest.fn(),
    };

    const mockStorageService = {
      getSignedUrl: jest.fn().mockResolvedValue('https://signed-url.com'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: StreakService,
          useValue: mockStreakService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: 'Logger',
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prismaService = module.get(PrismaService);
    profileService = module.get(ProfileService);
    logger = module.get('Logger');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockTransactionId = 'transaction-123';
    const mockPostData = {
      author: {
        connect: {
          id: 'profile-123',
        },
      },
      content: 'Test post content',
      medias: ['https://example.com/image.jpg'],
      tags: ['test'],
    };

    it('should create a post successfully', async () => {
      // Arrange
      const mockCreatedPost = {
        id: 'post-123',
        profileId: 'profile-123',
        content: 'Test post content',
        medias: ['https://example.com/image.jpg'],
        tags: ['test'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.post.create as jest.Mock).mockResolvedValue(
        mockCreatedPost as any,
      );

      // Act
      const result = await service.create({
        transactionId: mockTransactionId,
        data: mockPostData,
      });

      // Assert
      expect(prismaService.post.create).toHaveBeenCalledWith({
        data: mockPostData,
      });
      expect(result).toEqual(mockCreatedPost);
    });

    it('should throw PostCreateException on database error', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      (prismaService.post.create as jest.Mock).mockRejectedValue(databaseError);

      // Act & Assert
      await expect(
        service.create({
          transactionId: mockTransactionId,
          data: mockPostData,
        }),
      ).rejects.toThrow(PostCreateException);

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle unique constraint violation', async () => {
      // Arrange
      const uniqueError = new Error('Unique constraint violation');
      (uniqueError as any).code = 'P2002';
      (prismaService.post.create as jest.Mock).mockRejectedValue(uniqueError);

      // Act & Assert
      await expect(
        service.create({
          transactionId: mockTransactionId,
          data: mockPostData,
        }),
      ).rejects.toThrow(PostCreateException);
    });
  });

  describe('get', () => {
    const mockTransactionId = 'transaction-123';
    const mockWhere = { id: 'post-123' };

    it('should get a post successfully', async () => {
      // Arrange
      const mockPost = {
        id: 'post-123',
        profileId: 'profile-123',
        content: 'Test post content',
        medias: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.post.findUnique as jest.Mock).mockResolvedValue(
        mockPost as any,
      );

      // Act
      const result = await service.get({
        transactionId: mockTransactionId,
        where: mockWhere,
      });

      // Assert
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: mockWhere,
      });
      expect(result).toEqual(mockPost);
    });

    it('should get a post with select fields', async () => {
      // Arrange
      const mockPost = {
        id: 'post-123',
        content: 'Test post content',
      };

      const selectFields = { id: true, content: true };
      (prismaService.post.findUnique as jest.Mock).mockResolvedValue(
        mockPost as any,
      );

      // Act
      const result = await service.get({
        transactionId: mockTransactionId,
        where: mockWhere,
        select: selectFields,
      });

      // Assert
      expect(prismaService.post.findUnique).toHaveBeenCalledWith({
        where: mockWhere,
        select: selectFields,
      });
      expect(result).toEqual(mockPost);
    });

    it('should return null if post not found', async () => {
      // Arrange
      (prismaService.post.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.get({
        transactionId: mockTransactionId,
        where: mockWhere,
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should throw PostGetException on database error', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      (prismaService.post.findUnique as jest.Mock).mockRejectedValue(
        databaseError,
      );

      // Act & Assert
      await expect(
        service.get({
          transactionId: mockTransactionId,
          where: mockWhere,
        }),
      ).rejects.toThrow();
    });
  });

  describe('list', () => {
    const mockTransactionId = 'transaction-123';
    const mockWhere = {};

    it('should list posts successfully', async () => {
      // Arrange
      const mockPosts = [
        {
          id: 'post-1',
          content: 'Post 1',
          createdAt: new Date(),
        },
        {
          id: 'post-2',
          content: 'Post 2',
          createdAt: new Date(),
        },
      ];

      (prismaService.post.findMany as jest.Mock).mockResolvedValue(
        mockPosts as any,
      );

      // Act
      const result = await service.list({
        transactionId: mockTransactionId,
        where: mockWhere,
      });

      // Assert
      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        where: mockWhere,
      });
      expect(result).toEqual(mockPosts);
    });

    it('should list posts with pagination', async () => {
      // Arrange
      const mockPosts = [
        {
          id: 'post-1',
          content: 'Post 1',
        },
      ];

      const paginationOptions = {
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' as const },
      };

      (prismaService.post.findMany as jest.Mock).mockResolvedValue(
        mockPosts as any,
      );

      // Act
      const result = await service.list({
        transactionId: mockTransactionId,
        where: mockWhere,
        ...paginationOptions,
      });

      // Assert
      expect(prismaService.post.findMany).toHaveBeenCalledWith({
        where: mockWhere,
        ...paginationOptions,
      });
      expect(result).toEqual(mockPosts);
    });

    it('should return empty array if no posts found', async () => {
      // Arrange
      (prismaService.post.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await service.list({
        transactionId: mockTransactionId,
        where: mockWhere,
      });

      // Assert
      expect(result).toEqual([]);
    });

    it('should throw PostListException on database error', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      (prismaService.post.findMany as jest.Mock).mockRejectedValue(
        databaseError,
      );

      // Act & Assert
      await expect(
        service.list({
          transactionId: mockTransactionId,
          where: mockWhere,
        }),
      ).rejects.toThrow();
    });
  });

  describe('update', () => {
    const mockTransactionId = 'transaction-123';
    const mockWhere = { id: 'post-123' };
    const mockUpdateData = {
      content: 'Updated post content',
      tags: ['updated'],
    };

    it('should update a post successfully', async () => {
      // Arrange
      const mockUpdatedPost = {
        id: 'post-123',
        profileId: 'profile-123',
        content: 'Updated post content',
        tags: ['updated'],
        updatedAt: new Date(),
      };

      (prismaService.post.update as jest.Mock).mockResolvedValue(
        mockUpdatedPost as any,
      );

      // Act
      const result = await service.update({
        transactionId: mockTransactionId,
        where: mockWhere,
        data: mockUpdateData,
      });

      // Assert
      expect(prismaService.post.update).toHaveBeenCalledWith({
        where: mockWhere,
        data: mockUpdateData,
      });
      expect(result).toEqual(mockUpdatedPost);
    });

    it('should throw PostUpdateException on database error', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      (prismaService.post.update as jest.Mock).mockRejectedValue(databaseError);

      // Act & Assert
      await expect(
        service.update({
          transactionId: mockTransactionId,
          where: mockWhere,
          data: mockUpdateData,
        }),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    const mockTransactionId = 'transaction-123';
    const mockWhere = { id: 'post-123' };

    it('should delete a post successfully', async () => {
      // Arrange
      const mockDeletedPost = {
        id: 'post-123',
        profileId: 'profile-123',
        content: 'Deleted post',
        deletedAt: new Date(),
      };

      (prismaService.post.delete as jest.Mock).mockResolvedValue(
        mockDeletedPost as any,
      );

      // Act
      const result = await service.delete({
        transactionId: mockTransactionId,
        where: mockWhere,
      });

      // Assert
      expect(prismaService.post.delete).toHaveBeenCalledWith({
        where: mockWhere,
      });
      expect(result).toEqual(mockDeletedPost);
    });

    it('should throw PostDeleteException on database error', async () => {
      // Arrange
      const databaseError = new Error('Database connection failed');
      (prismaService.post.delete as jest.Mock).mockRejectedValue(databaseError);

      // Act & Assert
      await expect(
        service.delete({
          transactionId: mockTransactionId,
          where: mockWhere,
        }),
      ).rejects.toThrow();
    });
  });
});
