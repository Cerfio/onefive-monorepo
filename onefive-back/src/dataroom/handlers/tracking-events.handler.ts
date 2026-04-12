import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { TrackingService } from '../services/tracking.service';
import {
  SaveTrackingEventsDto,
  SaveTrackingEventsResponseDto,
} from '../dto/tracking-events.dto';

@Injectable()
export class TrackingEventsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly trackingService: TrackingService,
  ) {}

  async saveEvents(
    input: SaveTrackingEventsDto,
    profileId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<SaveTrackingEventsResponseDto> {
    try {
      const result = await this.trackingService.saveTrackingEvents({
        profileId,
        events: input.events.map((event) => ({
          eventType: event.eventType,
          dataroomId: event.dataroomId,
          fileId: event.fileId,
          sessionId: event.sessionId,
          timestamp: event.timestamp,
          sessionDuration: event.sessionDuration,
          additionalData: event.additionalData
            ? JSON.stringify(event.additionalData)
            : undefined,
        })),
        userAgent,
        ipAddress,
      });

      return {
        data: {
          processedEvents: result.processedEvents,
          message: 'Events processed successfully',
        },
      };
    } catch (error) {
      this.logger.error('Failed to save tracking events', {
        transactionId: input.transactionId,
        error: error.message,
        eventsCount: input.events.length,
      });

      return {
        data: {
          processedEvents: 0,
          message: 'Error during processing',
          errors: [error.message],
        },
      };
    }
  }
}
