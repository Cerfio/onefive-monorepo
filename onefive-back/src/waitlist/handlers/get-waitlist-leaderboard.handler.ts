import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { WaitlistService } from '../waitlist.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetWaitlistLeaderboardHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly waitlistService: WaitlistService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    limit = 20,
  }: {
    transactionId: string;
    userId: string;
    limit?: number;
  }) {
    this.logger.info('Getting waitlist leaderboard', {
      transactionId,
      userId,
      limit,
    });

    const leaderboard = await this.waitlistService.getLeaderboard(limit);

    this.logger.info('Waitlist leaderboard retrieved', {
      transactionId,
      count: leaderboard.length,
    });

    return leaderboard;
  }
}
