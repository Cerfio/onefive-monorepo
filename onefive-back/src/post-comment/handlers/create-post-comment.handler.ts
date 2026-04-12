import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostCommentService } from '../post-comment.service';
import { ProfileService } from '../../profile/profile.service';
import { Log } from '../../common/logger/logger.decorator';
import { CreatePostCommentDto } from '../dto/create-post-comment.dto';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreatePostCommentHandler {
  private readonly logger = new Logger(CreatePostCommentHandler.name);

  constructor(
    private readonly postCommentService: PostCommentService,
    private readonly profileService: ProfileService,
    private readonly notificationHelper: NotificationHelperService,
    private readonly prisma: PrismaService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    postId,
    createPostCommentDto,
  }: {
    transactionId: string;
    userId: string;
    postId: string;
    createPostCommentDto: CreatePostCommentDto;
  }) {
    this.logger.debug('Creating comment', {
      transactionId,
      userId,
      postId,
      content: createPostCommentDto.content,
      parentId: createPostCommentDto.parentId,
    });
    // Get user profile
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Create comment
    const comment = await this.postCommentService.create({
      transactionId,
      data: {
        author: {
          connect: {
            id: profile.id,
          },
        },
        post: {
          connect: {
            id: postId,
          },
        },
        content: createPostCommentDto.content,
        parent: createPostCommentDto.parentId
          ? {
              connect: {
                id: createPostCommentDto.parentId,
              },
            }
          : undefined,
      },
    });

    this.logger.debug('Comment created', {
      id: comment.id,
      parentId: comment.parentId,
    });

    // Send notification to post owner and parent comment author (if reply)
    try {
      // Get parent comment author if this is a reply
      let parentCommentAuthorId: string | undefined;
      if (createPostCommentDto.parentId) {
        const parentComment = await this.prisma.postComment.findUnique({
          where: { id: createPostCommentDto.parentId },
          select: { profileId: true },
        });
        parentCommentAuthorId = parentComment?.profileId;
      }

      await this.notificationHelper.notifyPostComment({
        postId,
        commentId: comment.id,
        actorProfileId: profile.id,
        actorName: `${profile.firstName} ${profile.lastName}`.trim(),
        isReply: !!createPostCommentDto.parentId,
        parentCommentAuthorId,
        parentId: createPostCommentDto.parentId,
      });
    } catch (error) {
      // Don't fail the comment if notification fails
      this.logger.error('Failed to send comment notification', error);
    }

    this.posthogService.capture(userId, 'post_comment_created', {
      post_id: postId,
    });

    return {
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      profileId: comment.profileId,
      content: comment.content,
      createdAt: comment.createdAt,
    };
  }
}
