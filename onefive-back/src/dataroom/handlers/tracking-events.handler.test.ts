import { Test, TestingModule } from '@nestjs/testing';
import { TrackingEventsHandler } from './tracking-events.handler';
import { TrackingService } from '../services/tracking.service';
import { LogService } from 'logstash-winston-3';

describe('TrackingEventsHandler', () => {
  let handler: TrackingEventsHandler;
  let trackingService: TrackingService;
  let logger: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingEventsHandler,
        {
          provide: TrackingService,
          useValue: {
            saveTrackingEvents: jest.fn(),
          },
        },
        {
          provide: 'Logger',
          useValue: {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<TrackingEventsHandler>(TrackingEventsHandler);
    trackingService = module.get<TrackingService>(TrackingService);
    logger = module.get<LogService>('Logger');
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should save tracking events successfully', async () => {
    const mockResult = {
      processedEvents: 2,
      message: '2 événements traités avec succès',
      errors: [],
    };

    (trackingService.saveTrackingEvents as jest.Mock).mockResolvedValue(
      mockResult,
    );

    const input = {
      events: [
        {
          eventType: 'view',
          dataroomId: 'dataroom-1',
          fileId: 'file-1',
          sessionId: 'session-1',
          timestamp: '2024-01-15T10:30:00Z',
          sessionDuration: 300,
          additionalData: { page: 'document' },
        },
        {
          eventType: 'download',
          dataroomId: 'dataroom-1',
          fileId: 'file-1',
          sessionId: 'session-1',
          timestamp: '2024-01-15T10:35:00Z',
        },
      ],
      transactionId: 'test-transaction',
    };

    const result = await handler.saveEvents(
      input,
      'profile-1',
      'Mozilla/5.0...',
      '192.168.1.1',
    );

    expect(result.data.processedEvents).toBe(2);
    expect(trackingService.saveTrackingEvents).toHaveBeenCalledWith({
      profileId: 'profile-1',
      events: [
        {
          eventType: 'view',
          dataroomId: 'dataroom-1',
          fileId: 'file-1',
          sessionId: 'session-1',
          timestamp: '2024-01-15T10:30:00Z',
          sessionDuration: 300,
          additionalData: '{"page":"document"}',
        },
        {
          eventType: 'download',
          dataroomId: 'dataroom-1',
          fileId: 'file-1',
          sessionId: 'session-1',
          timestamp: '2024-01-15T10:35:00Z',
          sessionDuration: undefined,
          additionalData: undefined,
        },
      ],
      userAgent: 'Mozilla/5.0...',
      ipAddress: '192.168.1.1',
    });
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Database connection failed');
    (trackingService.saveTrackingEvents as jest.Mock).mockRejectedValue(error);

    const input = {
      events: [
        {
          eventType: 'view',
          dataroomId: 'dataroom-1',
          fileId: 'file-1',
          sessionId: 'session-1',
          timestamp: '2024-01-15T10:30:00Z',
        },
      ],
      transactionId: 'test-transaction',
    };

    const result = await handler.saveEvents(input, 'profile-1');

    expect(result.data.processedEvents).toBe(0);
    expect(result.data.errors).toContain('Database connection failed');
  });
});
