import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { FollowsService } from '../follows.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetFollowsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly followsService: FollowsService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    this.logger.info('Getting user follows', {
      transactionId,
      userId,
    });

    // const follows = await this.followsService.getUserFollows({
    //   transactionId,
    //   userId,
    // });

    this.logger.info('User follows retrieved successfully', {
      transactionId,
      userId,
      // profilesCount: follows.profiles.length,
      // startupsCount: follows.startups.length,
    });

    return [];
  }
}
