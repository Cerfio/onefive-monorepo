import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileConnectionService } from '../profile-connection.service';
import { ProfileService } from '../../profile/profile.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class SendConnectionRequestHandler {
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

    if (profile.id === profileId) {
      throw new BadRequestException(
        'You cannot send a connection request to yourself',
      );
    }

    await this.profileConnectionService.sendRequest(profile.id, profileId);
    this.posthogService.capture(userId, 'connection_request_sent', {
      target_profile_id: profileId,
    });
    return { success: true };
  }
}
