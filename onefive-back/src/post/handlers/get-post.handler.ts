import { Injectable, NotFoundException } from '@nestjs/common';
import { PostService } from '../post.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetPostHandler {
  constructor(private readonly postService: PostService) {}

  @Log()
  async execute({
    transactionId,
    postId,
    takeComments = 10,
    takeReplies = 5,
  }: {
    transactionId: string;
    postId: string;
    takeComments?: number;
    takeReplies?: number;
  }) {
    const post = await this.postService.get({
      transactionId,
      where: { id: postId },
      select: {
        id: true,
        profileId: true,
        content: true,
        medias: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        comments: {
          take: takeComments,
          where: {
            parentId: null,
          },
          select: {
            id: true,
            profileId: true,
            parentId: true,
            content: true,
            createdAt: true,
            replies: {
              take: takeReplies,
              select: {
                id: true,
                profileId: true,
                content: true,
                createdAt: true,
                reactions: {
                  select: {
                    reaction: true,
                    profileId: true,
                  },
                },
                _count: {
                  select: {
                    reactions: true,
                  },
                },
              },
            },
            reactions: {
              select: {
                profileId: true,
                createdAt: true,
                reaction: true,
              },
            },
            _count: {
              select: {
                reactions: true,
              },
            },
          },
        },
        reactions: {
          select: {
            profileId: true,
            reaction: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: {
                parentId: null,
              },
            },
            reactions: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      id: post.id,
      profileId: post.profileId,
      content: post.content,
      medias: post.medias,
      tags: post.tags,
      comments:
        (
          post as {
            comments?: Array<{
              id: string;
              profileId: string;
              content: string;
              createdAt: Date;
              replies?: Array<{
                id: string;
                profileId: string;
                content: string;
                createdAt: Date;
                _count?: { reactions?: number };
                reactions?: Array<{ reaction: string; profileId: string }>;
              }>;
              _count?: { reactions?: number };
              reactions?: Array<{ profileId: string }>;
            }>;
          }
        ).comments?.map((comment) => ({
          id: comment.id,
          profileId: comment.profileId,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          replies:
            comment.replies?.map((reply) => ({
              id: reply.id,
              profileId: reply.profileId,
              content: reply.content,
              createdAt: reply.createdAt.toISOString(),
              reactionsCount: reply._count?.reactions || 0,
              reactions:
                reply.reactions?.map((reaction) => ({
                  reaction: reaction.reaction,
                  profileId: reaction.profileId,
                })) || [],
            })) || [],
          reactionsCount: comment._count?.reactions || 0,
          reactions:
            comment.reactions?.map((reaction) => ({
              profileId: reaction.profileId,
            })) || [],
        })) || [],
      reactions:
        (
          post as {
            reactions?: Array<{
              id: string;
              profileId: string;
              reaction: string;
              createdAt: Date;
            }>;
          }
        ).reactions?.map((reaction) => ({
          id: reaction.id,
          profileId: reaction.profileId,
          reaction: reaction.reaction,
          createdAt: reaction.createdAt.toISOString(),
        })) || [],
      commentsCount:
        (post as { _count?: { comments?: number } })._count?.comments || 0,
      reactionsCount:
        (post as { _count?: { reactions?: number } })._count?.reactions || 0,
      createdAt: post.createdAt.toISOString(),
    };
  }
}
