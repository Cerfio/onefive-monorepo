import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileConnectionService } from '../profile-connection.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class ListConnectionsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileConnectionService: ProfileConnectionService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const connections = await this.profileConnectionService.getConnections(
      profile.id,
    );
    return connections;
  }
}
