import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileConnectionService } from '../profile-connection.service';
import { ProfileService } from '../../profile/profile.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class AcceptConnectionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileConnectionService: ProfileConnectionService,
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

    await this.profileConnectionService.acceptRequest(profileId, profile.id);
    this.posthogService.capture(userId, 'connection_request_accepted', { target_profile_id: profileId });
    return { success: true };
  }
}
