import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPostHandler } from './get-post.handler';
import { PostService } from '../post.service';

describe('GetPostHandler', () => {
  let handler: GetPostHandler;
  let postService: jest.Mocked<PostService>;

  beforeEach(async () => {
    const mockPostService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostHandler,
        {
          provide: PostService,
          useValue: mockPostService,
        },
      ],
    }).compile();

    handler = module.get<GetPostHandler>(GetPostHandler);
    postService = module.get(PostService);
  });

  describe('execute', () => {
    const mockTransactionId = 'test-transaction-id';
    const mockPostId = 'post-id-123';
    const mockTakeComments = 10;
    const mockTakeReplies = 5;

    const mockPost = {
      id: mockPostId,
      profileId: 'profile-id-123',
      content: 'Test post content',
      medias: ['media1.jpg', 'media2.png'],
      tags: ['tag1', 'tag2'],
      createdAt: new Date('2024-01-01T12:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z'),
      comments: [
        {
          id: 'comment-id-1',
          profileId: 'comment-profile-id-1',
          parentId: null,
          content: 'Test comment',
          createdAt: new Date('2024-01-01T13:00:00Z'),
          replies: [
            {
              id: 'reply-id-1',
              profileId: 'reply-profile-id-1',
              content: 'Test reply',
              createdAt: new Date('2024-01-01T14:00:00Z'),
              _count: { reactions: 2 },
              reactions: [
                { reaction: 'LIKE', profileId: 'user1' },
                { reaction: 'LOVE', profileId: 'user2' },
              ],
            },
          ],
          _count: { reactions: 3 },
          reactions: [
            { profileId: 'user1' },
            { profileId: 'user2' },
            { profileId: 'user3' },
          ],
        },
      ],
      reactions: [
        {
          id: 'reaction-id-1',
          profileId: 'reaction-profile-id-1',
          reaction: 'LIKE',
          createdAt: new Date('2024-01-01T15:00:00Z'),
        },
      ],
      _count: {
        comments: 1,
        reactions: 1,
      },
    };

    it('should get post successfully with default parameters', async () => {
      // Arrange
      postService.get.mockResolvedValue(mockPost as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        postId: mockPostId,
      });

      // Assert
      expect(result).toEqual({
        id: mockPost.id,
        profileId: mockPost.profileId,
        content: mockPost.content,
        medias: mockPost.medias,
        tags: mockPost.tags,
        comments: [
          {
            id: 'comment-id-1',
            profileId: 'comment-profile-id-1',
            content: 'Test comment',
            createdAt: '2024-01-01T13:00:00.000Z',
            replies: [
              {
                id: 'reply-id-1',
                profileId: 'reply-profile-id-1',
                content: 'Test reply',
                createdAt: '2024-01-01T14:00:00.000Z',
                reactionsCount: 2,
                reactions: [
                  { reaction: 'LIKE', profileId: 'user1' },
                  { reaction: 'LOVE', profileId: 'user2' },
                ],
              },
            ],
            reactionsCount: 3,
            reactions: [
              { profileId: 'user1' },
              { profileId: 'user2' },
              { profileId: 'user3' },
            ],
          },
        ],
        reactions: [
          {
            id: 'reaction-id-1',
            profileId: 'reaction-profile-id-1',
            reaction: 'LIKE',
            createdAt: '2024-01-01T15:00:00.000Z',
          },
        ],
        commentsCount: 1,
        reactionsCount: 1,
        createdAt: '2024-01-01T12:00:00.000Z',
      });

      expect(postService.get).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockPostId },
        select: expect.any(Object), // Complex select object
      });
    });

    it('should get post with custom take parameters', async () => {
      // Arrange
      postService.get.mockResolvedValue(mockPost as any);

      // Act
      await handler.execute({
        transactionId: mockTransactionId,
        postId: mockPostId,
        takeComments: mockTakeComments,
        takeReplies: mockTakeReplies,
      });

      // Assert
      expect(postService.get).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockPostId },
        select: expect.objectContaining({
          comments: expect.objectContaining({
            take: mockTakeComments,
            where: { parentId: null },
            select: expect.objectContaining({
              replies: expect.objectContaining({
                take: mockTakeReplies,
              }),
            }),
          }),
        }),
      });
    });

    it('should throw NotFoundException when post not found', async () => {
      // Arrange
      postService.get.mockResolvedValue(null);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(postService.get).toHaveBeenCalledWith({
        transactionId: mockTransactionId,
        where: { id: mockPostId },
        select: expect.any(Object),
      });
    });

    it('should handle post with no comments', async () => {
      // Arrange
      const postWithoutComments = {
        ...mockPost,
        comments: [],
        _count: {
          comments: 0,
          reactions: 1,
        },
      };
      postService.get.mockResolvedValue(postWithoutComments as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        postId: mockPostId,
      });

      // Assert
      expect(result.comments).toEqual([]);
      expect(result.commentsCount).toBe(0);
    });

    it('should handle post with no reactions', async () => {
      // Arrange
      const postWithoutReactions = {
        ...mockPost,
        reactions: [],
        _count: {
          comments: 1,
          reactions: 0,
        },
      };
      postService.get.mockResolvedValue(postWithoutReactions as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        postId: mockPostId,
      });

      // Assert
      expect(result.reactions).toEqual([]);
      expect(result.reactionsCount).toBe(0);
    });

    it('should handle comments without replies', async () => {
      // Arrange
      const postWithCommentWithoutReplies = {
        ...mockPost,
        comments: [
          {
            id: 'comment-id-1',
            profileId: 'comment-profile-id-1',
            parentId: null,
            content: 'Test comment without replies',
            createdAt: new Date('2024-01-01T13:00:00Z'),
            replies: [],
            _count: { reactions: 1 },
            reactions: [{ profileId: 'user1' }],
          },
        ],
      };
      postService.get.mockResolvedValue(postWithCommentWithoutReplies as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        postId: mockPostId,
      });

      // Assert
      expect(result.comments[0].replies).toEqual([]);
    });

    it('should handle post service error', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      postService.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        handler.execute({
          transactionId: mockTransactionId,
          postId: mockPostId,
        }),
      ).rejects.toThrow(mockError);
    });

    it('should handle empty medias and tags', async () => {
      // Arrange
      const postWithEmptyArrays = {
        ...mockPost,
        medias: [],
        tags: [],
      };
      postService.get.mockResolvedValue(postWithEmptyArrays as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        postId: mockPostId,
      });

      // Assert
      expect(result.medias).toEqual([]);
      expect(result.tags).toEqual([]);
    });

    it('should correctly format dates to ISO strings', async () => {
      // Arrange
      const testDate = new Date('2024-01-01T12:00:00Z');
      const postWithTestDate = {
        ...mockPost,
        createdAt: testDate,
        comments: [
          {
            ...mockPost.comments[0],
            createdAt: testDate,
            replies: [
              {
                ...mockPost.comments[0].replies[0],
                createdAt: testDate,
              },
            ],
          },
        ],
        reactions: [
          {
            ...mockPost.reactions[0],
            createdAt: testDate,
          },
        ],
      };
      postService.get.mockResolvedValue(postWithTestDate as any);

      // Act
      const result = await handler.execute({
        transactionId: mockTransactionId,
        postId: mockPostId,
      });

      // Assert
      expect(result.createdAt).toBe(testDate.toISOString());
      expect(result.comments[0].createdAt).toBe(testDate.toISOString());
      expect(result.comments[0].replies[0].createdAt).toBe(
        testDate.toISOString(),
      );
      expect(result.reactions[0].createdAt).toBe(testDate.toISOString());
    });
  });
});
