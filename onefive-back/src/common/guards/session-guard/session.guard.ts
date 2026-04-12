import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { TokenUnauthorizedException } from './session.exception';
import { Reflector } from '@nestjs/core';
import { SessionsService } from 'src/sessions/sessions.service';
import { StreakService } from 'src/streak/streak.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionsService,
    // private readonly streakService: StreakService,
    private reflector: Reflector,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  private extractTokenFromCookie(cookieHeader: string): string {
    if (!cookieHeader) {
      TokenUnauthorizedException.throw(this.logger, {
        transactionId: 'unknown',
        error: 'No cookie header present',
        timestamp: new Date().toISOString(),
      });
    }

    const tokenPrefix = 'token=';
    const cookieArray = cookieHeader.split(';').map((cookie) => cookie.trim());
    const fullToken = cookieArray.find((cookie) =>
      cookie.startsWith(tokenPrefix),
    );

    if (!fullToken) {
      TokenUnauthorizedException.throw(this.logger, {
        transactionId: 'unknown',
        error: 'Token not in cookie',
        timestamp: new Date().toISOString(),
      });
    }

    const token = fullToken.substring(tokenPrefix.length);
    if (!token) {
      TokenUnauthorizedException.throw(this.logger, {
        transactionId: 'unknown',
        error: 'Nothing after token=',
        timestamp: new Date().toISOString(),
      });
    }

    return token;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    try {
      const token = this.extractTokenFromCookie(request.headers.cookie);
      const session = await this.sessionService.validateSession({
        sessionId: token,
        transactionId: request.transactionId,
      });

      // Attach session info to request
      request.userId = session.userId;
      request.session = session; // Add full session if needed elsewhere

      return true;
    } catch (error) {
      TokenUnauthorizedException.throw(this.logger, {
        transactionId: request.transactionId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
