import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { ProfileAnalyticsService } from '../profile-analytics.service';
import {
  VisitorsAnalyticsResponseDto,
  TimeRange,
} from '../dto/get-visitors-analytics.dto';

@Injectable()
export class GetVisitorsAnalyticsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileAnalyticsService: ProfileAnalyticsService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    timeRange,
  }: {
    transactionId: string;
    userId: string;
    timeRange?: TimeRange;
  }): Promise<VisitorsAnalyticsResponseDto> {
    return await this.profileAnalyticsService.getVisitorsAnalytics({
      transactionId,
      userId,
      timeRange,
    });
  }
}
