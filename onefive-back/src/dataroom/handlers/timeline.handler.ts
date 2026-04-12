import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { TimelineService } from '../services/timeline.service';
import {
  GetUserTimelineDto,
  GetUserTimelineResponseDto,
  GetDataroomTimelineDto,
  GetDataroomTimelineResponseDto,
} from '../dto/timeline.dto';

@Injectable()
export class TimelineHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly timelineService: TimelineService,
  ) {}

  async getUserTimeline(
    input: GetUserTimelineDto,
    dataroomId: string,
  ): Promise<GetUserTimelineResponseDto> {
    try {
      const timeline = await this.timelineService.getUserTimeline({
        userId: input.userId,
        dataroomId,
      });

      return {
        data: timeline,
      };
    } catch (error) {
      this.logger.error('Failed to get user timeline', {
        transactionId: input.transactionId,
        userId: input.userId,
        dataroomId,
        error: error.message,
      });

      return {
        data: {
          userId: input.userId,
          userName: '',
          timeline: [],
        },
      };
    }
  }

  async getDataroomTimeline(
    input: GetDataroomTimelineDto,
    dataroomId: string,
  ): Promise<GetDataroomTimelineResponseDto> {
    try {
      const timeline = await this.timelineService.getDataroomTimeline({
        dataroomId,
      });

      return {
        data: timeline,
      };
    } catch (error) {
      this.logger.error('Failed to get dataroom timeline', {
        transactionId: input.transactionId,
        dataroomId,
        error: error.message,
      });

      return {
        data: {
          dataroomId,
          timeline: [],
        },
      };
    }
  }
}
