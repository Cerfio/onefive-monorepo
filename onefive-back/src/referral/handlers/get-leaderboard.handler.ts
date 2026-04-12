import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { ReferralService } from '../referral.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetLeaderboardHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly referralService: ReferralService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    limit = 10,
  }: {
    transactionId: string;
    userId: string;
    limit?: number;
  }) {
    this.logger.info('Getting referral leaderboard', {
      transactionId,
      userId,
      limit,
    });

    const leaderboard = await this.referralService.getLeaderboard(limit);

    this.logger.info('Leaderboard retrieved', {
      transactionId,
      count: leaderboard.length,
    });

    return leaderboard;
  }
}
