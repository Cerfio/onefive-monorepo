import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { NetworkService } from '../network.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class UnfollowProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly networkService: NetworkService,
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

    try {
      const follow = await this.networkService.unfollowProfile({
        transactionId,
        userId,
        profileId,
      });

      this.logger.info('Profile unfollow successful', {
        transactionId,
        userId,
        profileId,
        followId: follow.id,
      });

      return follow;
    } catch (error) {
      this.logger.error('Failed to unfollow profile', {
        transactionId,
        userId,
        profileId,
        error: error.message,
      });
      throw error;
    }
  }
}
