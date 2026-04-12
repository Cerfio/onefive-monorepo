import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileFollowService } from '../profile-follow.service';
import { ProfileService } from '../../profile/profile.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class UnfollowProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileFollowService: ProfileFollowService,
    private readonly profileService: ProfileService,
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
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.profileFollowService.unfollow(profile.id, profileId);
    this.posthogService.capture(userId, 'profile_unfollowed', {
      target_profile_id: profileId,
    });
    return { success: true };
  }
}
