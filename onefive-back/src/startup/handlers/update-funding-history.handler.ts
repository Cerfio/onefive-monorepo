import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';
import { UpdateFundingHistoryDto } from '../dto/funding-history.dto';
import { PostHogService } from 'src/posthog/posthog.service';
import { StartupUpdateException } from '../startup.exception';

@Injectable()
export class UpdateFundingHistoryHandler {
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
    data,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    historyId: string;
    data: UpdateFundingHistoryDto;
  }) {
    this.logger.info('Updating funding history entry', {
      transactionId,
      userId,
      startupId,
      historyId,
    });

    try {
      const historyEntry = await this.startupService.updateFundingHistory({
        transactionId,
        startupId,
        userId,
        historyId,
        data,
      });

      this.logger.info('Funding history entry updated successfully', {
        transactionId,
        startupId,
        userId,
        historyId,
      });

      this.posthogService.capture(userId, 'funding_history_updated', {
        startup_id: startupId,
      });

      return historyEntry;
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
