import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { SessionsService } from '../sessions.service';
import { RevokeSessionResponseDto } from '../dto/revoke-session.dto';
import { Log } from 'src/common/logger/logger.decorator';
import {
  SessionNotFoundException,
  SessionCannotRevokeCurrentException,
} from '../sessions.exception';

@Injectable()
export class RevokeSessionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    sessionDatabaseId,
    currentSessionId,
  }: {
    transactionId: string;
    userId: string;
    sessionDatabaseId: string;
    currentSessionId: string;
  }): Promise<void> {
    // Get the session to check if it's the current one
    const sessions = await this.sessionsService.listActiveSessions({
      transactionId,
      userId,
    });

    const sessionToRevoke = sessions.find((s) => s.id === sessionDatabaseId);
    if (!sessionToRevoke) {
      SessionNotFoundException.throw(this.logger, {
        transactionId,
        sessionDatabaseId,
      });
    }

    // Prevent revoking current session
    if (sessionToRevoke.sessionId === currentSessionId) {
      SessionCannotRevokeCurrentException.throw(this.logger, {
        transactionId,
        sessionDatabaseId,
      });
    }

    await this.sessionsService.revokeSession({
      transactionId,
      userId,
      sessionDatabaseId,
    });
  }
}
