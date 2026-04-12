import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { NetworkService } from '../network.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class UnfollowStartupHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly networkService: NetworkService,
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

    try {
      const follow = await this.networkService.unfollowStartup({
        transactionId,
        userId,
        startupId,
      });

      this.logger.info('Startup unfollow successful', {
        transactionId,
        userId,
        startupId,
        followId: follow.id,
      });

      return follow;
    } catch (error) {
      this.logger.error('Failed to unfollow startup', {
        transactionId,
        userId,
        startupId,
        error: error.message,
      });
      throw error;
    }
  }
}
