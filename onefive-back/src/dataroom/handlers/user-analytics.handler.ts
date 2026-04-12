import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { UserAnalyticsService } from '../services/user-analytics.service';
import {
  GetUserAnalyticsDto,
  GetUserAnalyticsResponseDto,
} from '../dto/user-analytics.dto';

@Injectable()
export class UserAnalyticsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly userAnalyticsService: UserAnalyticsService,
  ) {}

  async getUserAnalytics(
    input: GetUserAnalyticsDto,
    dataroomId: string,
  ): Promise<GetUserAnalyticsResponseDto> {
    try {
      const analytics = await this.userAnalyticsService.getUserAnalytics({
        userId: input.userId,
        dataroomId,
        period: input.period || '7d',
      });

      return {
        data: analytics,
      };
    } catch (error) {
      this.logger.error('Failed to get user analytics', {
        transactionId: input.transactionId,
        userId: input.userId,
        dataroomId,
        error: error.message,
      });

      return {
        data: {
          userId: input.userId,
          userName: '',
          userEmail: '',
          userRole: '',
          userGroup: '',
          totalViews: 0,
          totalTimeSpent: 0,
          filesViewed: 0,
          lastActivity: '',
          avgSessionDuration: 0,
        },
      };
    }
  }
}
