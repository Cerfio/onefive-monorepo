import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetProfileStartupsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
  ) {}

  @Log()
  async execute({
    transactionId,
    profileId,
  }: {
    transactionId: string;
    profileId: string;
  }) {
    this.logger.info('Getting startups for profile', {
      transactionId,
      profileId,
    });

    const startups =
      await this.startupService.getStartupsByProfileId(profileId);

    this.logger.info('Profile startups retrieved', {
      transactionId,
      profileId,
      count: startups.length,
    });

    return startups;
  }
}
