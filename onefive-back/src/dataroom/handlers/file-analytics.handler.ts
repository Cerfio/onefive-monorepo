import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { FileAnalyticsService } from '../services/file-analytics.service';
import {
  GetFileAnalyticsDto,
  GetFileAnalyticsResponseDto,
} from '../dto/file-analytics.dto';

@Injectable()
export class FileAnalyticsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly fileAnalyticsService: FileAnalyticsService,
  ) {}

  async getFileAnalytics(
    input: GetFileAnalyticsDto,
  ): Promise<GetFileAnalyticsResponseDto> {
    try {
      const analytics = await this.fileAnalyticsService.getFileAnalytics({
        fileId: input.fileId,
        period: input.period || '7d',
      });

      return {
        data: analytics,
      };
    } catch (error) {
      this.logger.error('Failed to get file analytics', {
        transactionId: input.transactionId,
        fileId: input.fileId,
        error: error.message,
      });

      return {
        data: {
          fileId: input.fileId,
          fileName: '',
          totalViews: 0,
          uniqueViewers: 0,
          avgTimeSpent: 0,
          downloadCount: 0,
          category: '',
          uploadedAt: '',
          lastViewed: '',
        },
      };
    }
  }
}
