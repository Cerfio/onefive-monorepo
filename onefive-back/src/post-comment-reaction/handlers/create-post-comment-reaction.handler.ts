import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfileService } from 'src/profile/profile.service';
import { ReactionType } from '@prisma/client';
import { NotificationHelperService } from 'src/notification/notification-helper.service';

@Injectable()
export class CreatePostCommentReactionHandler {
  private readonly logger = new Logger(CreatePostCommentReactionHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
    private readonly notificationHelper: NotificationHelperService,
  ) {}

  @Log()
  async execute({
    transactionId,
    commentId,
    userId,
    reaction,
  }: {
    transactionId: string;
    commentId: string;
    userId: string;
    reaction: ReactionType;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const existing = await this.prisma.postCommentReaction.findUnique({
      where: { commentId_profileId: { commentId, profileId: profile.id } },
    });

    if (existing) {
      return await this.prisma.postCommentReaction.update({
        where: { commentId_profileId: { commentId, profileId: profile.id } },
        data: { reaction },
      });
    }

    const newReaction = await this.prisma.postCommentReaction.create({
      data: {
        reaction,
        comment: { connect: { id: commentId } },
        profile: { connect: { id: profile.id } },
      },
    });

    // Send notification
    try {
      await this.notificationHelper.notifyCommentReaction({
        commentId,
        actorProfileId: profile.id,
        actorName: `${profile.firstName} ${profile.lastName}`.trim(),
      });
    } catch (error) {
      this.logger.error('Failed to send comment reaction notification', error);
    }

    return newReaction;
  }
}
