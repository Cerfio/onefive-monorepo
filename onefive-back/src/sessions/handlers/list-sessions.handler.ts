import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { SessionsService } from '../sessions.service';
import { GetSessionsResponseDto } from '../dto/get-sessions.dto';
import { Log } from 'src/common/logger/logger.decorator';

@Injectable()
export class ListSessionsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    currentSessionId,
  }: {
    transactionId: string;
    userId: string;
    currentSessionId: string;
  }): Promise<GetSessionsResponseDto> {
    const sessions = await this.sessionsService.listActiveSessions({
      transactionId,
      userId,
    });

    const sessionItems = sessions.map((session) => ({
      id: session.id,
      deviceInfo: session.deviceInfo || 'Unknown Device',
      location: session.location || 'Unknown',
      ipAddress: session.ipAddress || 'Unknown',
      userAgent: session.userAgent || 'Unknown',
      lastUsage: session.lastUsage,
      createdAt: session.createdAt,
      isCurrentSession: session.sessionId === currentSessionId,
    }));

    return {
      sessions: sessionItems,
      total: sessionItems.length,
    };
  }
}
