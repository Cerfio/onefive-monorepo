import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileConnectionService } from '../profile-connection.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class GetMutualConnectionsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileConnectionService: ProfileConnectionService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    otherProfileId,
  }: {
    transactionId: string;
    userId: string;
    otherProfileId: string;
  }) {
    const viewer = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    if (!viewer) {
      throw new NotFoundException('Profile not found');
    }

    const profiles = await this.profileConnectionService.getMutualConnections(
      viewer.id,
      otherProfileId,
    );

    return { count: profiles.length, profiles };
  }
}
