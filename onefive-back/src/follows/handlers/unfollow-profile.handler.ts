import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { FollowsService } from '../follows.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class UnfollowProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly followsService: FollowsService,
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
    this.logger.info('Unfollowing profile', {
      transactionId,
      userId,
      profileId,
    });

    const result = await this.followsService.unfollowProfile({
      transactionId,
      userId,
      profileId,
    });

    this.logger.info('Profile unfollowed successfully', {
      transactionId,
      userId,
      profileId,
    });

    return result;
  }
}
