import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { FollowsService } from '../follows.service';
import { Log } from '../../common/logger/logger.decorator';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class FollowProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly followsService: FollowsService,
    private readonly notificationHelper: NotificationHelperService,
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    this.logger.info('Following profile', {
      transactionId,
      userId,
      profileId,
    });

    const follow = await this.followsService.followProfile({
      transactionId,
      userId,
      profileId,
    });

    // Send notification to the followed profile (with LinkedIn-style aggregation)
    try {
      // Récupérer les informations du profil qui suit
      const followerProfile = await this.profileService.get({
        transactionId,
        where: { userId },
        select: { id: true, firstName: true, lastName: true },
      });

      if (followerProfile && followerProfile.id !== profileId) {
        await this.notificationHelper.notifyFollow({
          followedProfileId: profileId,
          followerProfileId: followerProfile.id,
          followerName:
            `${followerProfile.firstName} ${followerProfile.lastName}`.trim(),
        });
      }
    } catch (error) {
      // Don't fail the follow if notification fails
      this.logger.error('Failed to send follow notification', {
        transactionId,
        userId,
        profileId,
        error: error.message,
      });
    }

    this.logger.info('Profile followed successfully', {
      transactionId,
      userId,
      profileId,
      followId: follow.id,
    });

    return follow;
  }
}

// Export the handler class for testing
export { FollowProfileHandler as TestableFollowProfileHandler };
