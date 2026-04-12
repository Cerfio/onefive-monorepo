import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../../storage/storage.service';
import { FileProcessingService } from '../../common/services/file-processing.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeletePostHandler } from './delete-post.handler';
import { PostService } from '../post.service';
import { ProfileService } from '../../profile/profile.service';

describe('DeletePostHandler', () => {
  let handler: DeletePostHandler;
  let postService: jest.Mocked<PostService>;
  let profileService: any;

  beforeEach(async () => {
    const mockPostService = {
      get: jest.fn(),
      delete: jest.fn(),
    };

    const mockProfileService = {
      get: jest.fn().mockResolvedValue({ id: 'profile-id' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FileProcessingService,
          useValue: { processFiles: jest.fn(), validateFile: jest.fn() },
        },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getFileUrl: jest.fn(),
          },
        },
        {
          provide: 'Logger',
          useValue: {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            post: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            profile: { findUnique: jest.fn() },
          },
        },
        DeletePostHandler,
        {
          provide: PostService,
          useValue: mockPostService,
        },
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    handler = module.get<DeletePostHandler>(DeletePostHandler);
    postService = module.get(PostService);
    profileService = module.get(ProfileService);
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockPostId = 'post-id-123';
    const mockUserId = 'user-id-123';
    const mockProfileId = 'profile-id';

    const mockExistingPost = {
      profileId: mockProfileId,
    };

    it('should delete post successfully', async () => {
      // Arrange
      postService.get.mockResolvedValue(mockExistingPost as any);
      postService.delete.mockResolvedValue(undefined as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        postId: mockPostId,
        userId: mockUserId,
      });

      // Assert
      expect(result).toEqual({ message: 'Post deleted successfully' });
      expect(postService.get).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockPostId },
        select: { profileId: true },
      });
      expect(postService.delete).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockPostId },
      });
    });

    it('should throw NotFoundException when post not found', async () => {
      // Arrange
      postService.get.mockResolvedValue(null as any);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(postService.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user does not own the post', async () => {
      // Arrange
      const differentUserPost = {
        profileId: 'different-user-id',
      };
      postService.get.mockResolvedValue(differentUserPost as any);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(postService.delete).not.toHaveBeenCalled();
    });

    it('should handle post service get error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      postService.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);

      expect(postService.delete).not.toHaveBeenCalled();
    });

    it('should handle post service delete error', async () => {
      // Arrange
      const mockError = new Error('Delete operation failed');
      postService.get.mockResolvedValue(mockExistingPost as any);
      postService.delete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle invalid post ID', async () => {
      // Arrange
      postService.get.mockResolvedValue(null as any);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: 'invalid-post-id',
          userId: mockUserId,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle invalid user ID', async () => {
      // Arrange
      const differentUserPost = {
        profileId: 'different-user-id',
      };
      postService.get.mockResolvedValue(differentUserPost as any);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
          userId: 'invalid-user-id',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle posts with dependencies', async () => {
      // Arrange - Simulate post with comments that prevent deletion
      const mockError = new Error('Cannot delete post with existing comments');
      postService.get.mockResolvedValue(mockExistingPost as any);
      postService.delete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle concurrent delete operations', async () => {
      // Arrange
      const mockError = new Error('Post already deleted');
      postService.get.mockResolvedValue(mockExistingPost as any);
      postService.delete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle database transaction errors', async () => {
      // Arrange
      const mockError = new Error('Transaction rolled back');
      postService.get.mockResolvedValue(mockExistingPost as any);
      postService.delete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle posts that are already being processed', async () => {
      // Arrange
      const mockError = new Error('Post is currently being processed');
      postService.get.mockResolvedValue(mockExistingPost as any);
      postService.delete.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(mockError);
    });
  });
});
