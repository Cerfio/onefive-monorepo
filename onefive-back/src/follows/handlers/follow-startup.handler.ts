import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { FollowsService } from '../follows.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class FollowStartupHandler {
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
    this.logger.info('Following startup', {
      transactionId,
      userId,
      startupId,
    });

    const follow = await this.followsService.followStartup({
      transactionId,
      userId,
      startupId,
    });

    this.logger.info('Startup followed successfully', {
      transactionId,
      userId,
      startupId,
      followId: follow.id,
    });

    return follow;
  }
}
