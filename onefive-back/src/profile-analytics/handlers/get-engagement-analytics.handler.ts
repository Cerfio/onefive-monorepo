import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { ProfileAnalyticsService } from '../profile-analytics.service';
import { EngagementAnalyticsResponseDto } from '../dto/get-engagement-analytics.dto';
import { TimeRange } from '../dto/get-visitors-analytics.dto';

@Injectable()
export class GetEngagementAnalyticsHandler {
  constructor(
    private readonly profileAnalyticsService: ProfileAnalyticsService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    timeRange = TimeRange.THIRTY_DAYS,
    skip = 0,
    limit = 10,
    search,
    sortBy = 'date',
    sortOrder = 'desc',
  }: {
    transactionId: string;
    userId: string;
    timeRange?: TimeRange;
    skip?: number;
    limit?: number;
    search?: string;
    sortBy?: 'date' | 'views' | 'likes' | 'comments' | 'shares';
    sortOrder?: 'asc' | 'desc';
  }): Promise<EngagementAnalyticsResponseDto> {
    return await this.profileAnalyticsService.getEngagementAnalytics({
      transactionId,
      userId,
      timeRange,
      skip,
      limit,
      search,
      sortBy,
      sortOrder,
    });
  }
}
