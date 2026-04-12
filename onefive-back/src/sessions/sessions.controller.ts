import { Controller, Delete, Get, Param, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { ListSessionsHandler } from './handlers/list-sessions.handler';
import { RevokeSessionHandler } from './handlers/revoke-session.handler';
import { GetSessionsResponseDto } from './dto/get-sessions.dto';
import { RevokeSessionResponseDto } from './dto/revoke-session.dto';
import {
  SessionNotFoundException,
  SessionCannotRevokeCurrentException,
} from './sessions.exception';
import { AllowWaitlistNotActive } from 'src/common/decorators/allow-waitlist-not-active.decorator';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly listSessionsHandler: ListSessionsHandler,
    private readonly revokeSessionHandler: RevokeSessionHandler,
  ) {}

  @AllowWaitlistNotActive()
  @Get()
  async listSessions(@Req() req: FastifyRequest & FastifyRequestUserId) {
    const result = await this.listSessionsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      currentSessionId: req.session.sessionId,
    });
    return { success: true, data: result };
  }

  @AllowWaitlistNotActive()
  @Delete(':sessionId')
  async revokeSession(
    @Req() req: FastifyRequest & FastifyRequestUserId,
    @Param('sessionId') sessionId: string,
  ) {
    try {
      await this.revokeSessionHandler.execute({
        transactionId: req.id,
        userId: req.userId,
        sessionDatabaseId: sessionId,
        currentSessionId: req.session.sessionId,
      });
      return {
        success: true,
        data: { message: 'Session revoked successfully' },
      };
    } catch (error) {
      // Re-throw custom exceptions to be handled by global exception filter
      if (
        error instanceof SessionNotFoundException ||
        error instanceof SessionCannotRevokeCurrentException
      ) {
        throw error;
      }
      // Re-throw any other unexpected errors
      throw error;
    }
  }
}
