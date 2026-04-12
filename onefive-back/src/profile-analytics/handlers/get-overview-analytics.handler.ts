import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { ProfileAnalyticsService } from '../profile-analytics.service';
import { OverviewAnalyticsResponseDto } from '../dto/get-overview-analytics.dto';
import { TimeRange } from '../dto/get-visitors-analytics.dto';

@Injectable()
export class GetOverviewAnalyticsHandler {
  constructor(
    private readonly profileAnalyticsService: ProfileAnalyticsService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    timeRange = TimeRange.THIRTY_DAYS,
  }: {
    transactionId: string;
    userId: string;
    timeRange?: TimeRange;
  }): Promise<OverviewAnalyticsResponseDto> {
    return await this.profileAnalyticsService.getOverviewAnalytics({
      transactionId,
      userId,
      timeRange,
    });
  }
}
