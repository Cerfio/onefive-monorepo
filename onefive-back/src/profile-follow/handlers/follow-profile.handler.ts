import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileFollowService } from '../profile-follow.service';
import { ProfileService } from '../../profile/profile.service';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class FollowProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileFollowService: ProfileFollowService,
    private readonly profileService: ProfileService,
    private readonly notificationHelper: NotificationHelperService,
    private readonly posthogService: PostHogService,
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
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.id === profileId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    await this.profileFollowService.follow(profile.id, profileId);
    this.posthogService.capture(userId, 'profile_followed', {
      target_profile_id: profileId,
    });

    try {
      await this.notificationHelper.notifyFollow({
        followedProfileId: profileId,
        followerProfileId: profile.id,
        followerName: `${profile.firstName} ${profile.lastName}`.trim(),
      });
    } catch (error) {
      this.logger.error('Failed to send follow notification', {
        transactionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return { success: true };
  }
}
