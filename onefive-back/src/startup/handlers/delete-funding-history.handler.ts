import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';
import { PostHogService } from 'src/posthog/posthog.service';
import { StartupUpdateException } from '../startup.exception';

@Injectable()
export class DeleteFundingHistoryHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    startupId,
    historyId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    historyId: string;
  }) {
    this.logger.info('Deleting funding history entry', {
      transactionId,
      userId,
      startupId,
      historyId,
    });

    try {
      await this.startupService.deleteFundingHistory({
        transactionId,
        startupId,
        userId,
        historyId,
      });

      this.logger.info('Funding history entry deleted successfully', {
        transactionId,
        startupId,
        userId,
        historyId,
      });

      this.posthogService.capture(userId, 'funding_history_deleted', {
        startup_id: startupId,
      });

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }
      StartupUpdateException.throw(this.logger, {
        transactionId,
        startupId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
