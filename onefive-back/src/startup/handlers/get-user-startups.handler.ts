import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetUserStartupsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    this.logger.info('Getting user startups', {
      transactionId,
      userId,
    });

    const startups = await this.startupService.getUserStartups(userId);

    this.logger.info('User startups retrieved', {
      transactionId,
      userId,
      count: startups.length,
    });

    return startups;
  }
}
