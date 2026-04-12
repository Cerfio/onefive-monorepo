import { Injectable, NotFoundException } from '@nestjs/common';
import { PostCommentService } from '../post-comment.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetPostCommentHandler {
  constructor(private readonly postCommentService: PostCommentService) {}

  @Log()
  async execute({
    transactionId,
    commentId,
  }: {
    transactionId: string;
    commentId: string;
  }) {
    const comment = await this.postCommentService.get({
      transactionId,
      where: { id: commentId },
      select: {
        id: true,
        postId: true,
        parentId: true,
        profileId: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            reactions: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Post comment not found');
    }

    return {
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      profileId: comment.profileId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: (
          comment as {
            author?: {
              id: string;
              firstName: string;
              lastName: string;
            };
          }
        ).author?.id,
        name: `${(comment as { author?: { firstName: string; lastName: string } }).author?.firstName} ${(comment as { author?: { firstName: string; lastName: string } }).author?.lastName}`,
      },
      reactionsCount:
        (comment as { _count?: { reactions?: number } })._count?.reactions || 0,
    };
  }
}
