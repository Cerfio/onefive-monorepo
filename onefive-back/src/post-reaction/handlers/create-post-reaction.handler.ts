import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostReactionService } from '../post-reaction.service';
import { Log } from '../../common/logger/logger.decorator';
import { CreatePostReactionDto } from '../dto/create-post-reaction.dto';
import { ProfileService } from '../../profile/profile.service';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreatePostReactionHandler {
  private readonly logger = new Logger(CreatePostReactionHandler.name);

  constructor(
    private readonly postReactionService: PostReactionService,
    private readonly profileService: ProfileService,
    private readonly notificationHelper: NotificationHelperService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    postId,
    userId,
    createPostReactionDto,
  }: {
    transactionId: string;
    postId: string;
    userId: string;
    createPostReactionDto: CreatePostReactionDto;
  }) {
    // Resolve current user's profile id
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Check if user already reacted
    const existingReaction = await this.postReactionService.get({
      transactionId,
      where: {
        postId_profileId: {
          postId,
          profileId: profile.id,
        },
      },
    });

    if (existingReaction) {
      // Update existing reaction
      const updatedReaction = await this.postReactionService.update({
        transactionId,
        where: {
          postId_profileId: {
            postId,
            profileId: profile.id,
          },
        },
        data: { reaction: createPostReactionDto.reaction },
      });

      return {
        id: updatedReaction.id,
        reaction: updatedReaction.reaction,
        profileId: updatedReaction.profileId,
        createdAt: updatedReaction.createdAt,
      };
    } else {
      // Create new reaction
      const reaction = await this.postReactionService.create({
        transactionId,
        data: {
          post: {
            connect: {
              id: postId,
            },
          },
          profile: {
            connect: {
              id: profile.id,
            },
          },
          reaction: createPostReactionDto.reaction,
        },
      });

      // Send notification to post owner (if not the same person)
      try {
        await this.notificationHelper.notifyPostLike({
          postId,
          actorProfileId: profile.id,
          actorName: `${profile.firstName} ${profile.lastName}`.trim(),
        });
      } catch (error) {
        // Don't fail the reaction if notification fails
        this.logger.error('Failed to send reaction notification', error);
      }

      this.posthogService.capture(userId, 'post_reaction_created', { post_id: postId, reaction: createPostReactionDto.reaction });

      return {
        id: reaction.id,
        reaction: reaction.reaction,
        profileId: reaction.profileId,
        createdAt: reaction.createdAt,
      };
    }
  }
}
