import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { NetworkService } from '../network.service';
import { Log } from '../../common/logger/logger.decorator';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class FollowProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly networkService: NetworkService,
    private readonly notificationHelper: NotificationHelperService,
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

    try {
      const follow = await this.networkService.followProfile({
        transactionId,
        userId,
        profileId,
      });

      // Send notification to the followed profile (with LinkedIn-style aggregation)
      try {
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
      } catch (notifError) {
        this.logger.error('Failed to send follow notification', {
          transactionId,
          userId,
          profileId,
          error: (notifError as Error).message,
        });
      }

      this.logger.info('Profile follow successful', {
        transactionId,
        userId,
        profileId,
        followId: follow.id,
      });

      return follow;
    } catch (error) {
      this.logger.error('Failed to follow profile', {
        transactionId,
        userId,
        profileId,
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
