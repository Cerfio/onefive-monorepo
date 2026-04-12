import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { FollowsService } from '../follows.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class UnfollowStartupHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly followsService: FollowsService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    startupId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
  }) {
    this.logger.info('Unfollowing startup', {
      transactionId,
      userId,
      startupId,
    });

    const result = await this.followsService.unfollowStartup({
      transactionId,
      userId,
      startupId,
    });

    this.logger.info('Startup unfollowed successfully', {
      transactionId,
      userId,
      startupId,
    });

    return result;
  }
}
