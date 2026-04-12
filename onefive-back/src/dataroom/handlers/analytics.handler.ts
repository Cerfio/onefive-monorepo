import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { TrackingService } from '../services/tracking.service';
import { GetAnalyticsDto, GetAnalyticsResponseDto } from '../dto/analytics.dto';

@Injectable()
export class AnalyticsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly trackingService: TrackingService,
  ) {}

  async getDataroomAnalytics(
    input: GetAnalyticsDto,
    dataroomId: string,
    profileId: string,
  ): Promise<GetAnalyticsResponseDto> {
    try {
      const analytics = await this.trackingService.getDataroomAnalytics({
        dataroomId,
        profileId,
        period: input.period || '7d',
      });

      return {
        data: {
          dataroomId,
          totalViews: analytics.totalViews,
          uniqueViewers: analytics.uniqueViewers,
          avgSessionDuration: analytics.avgSessionDuration,
          topFiles: analytics.topFiles,
          userActivity: analytics.userActivity,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get dataroom analytics', {
        transactionId: input.transactionId,
        dataroomId,
        profileId,
        error: error.message,
      });

      return {
        data: {
          dataroomId,
          totalViews: 0,
          uniqueViewers: 0,
          avgSessionDuration: 0,
          topFiles: [],
          userActivity: [],
        },
      };
    }
  }
}
