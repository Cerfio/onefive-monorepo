import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileConnectionService } from '../profile-connection.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class GetConnectionStatusHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileConnectionService: ProfileConnectionService,
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
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const status = await this.profileConnectionService.getConnectionStatus(
      profile.id,
      profileId,
    );
    return status;
  }
}
