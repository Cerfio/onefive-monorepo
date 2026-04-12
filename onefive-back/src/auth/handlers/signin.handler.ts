import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LogService } from 'logstash-winston-3';
import {
  AuthenticationBadPasswordException,
  AuthenticationNotFoundException,
} from '../auth.exception';
import { Log } from 'src/common/logger/logger.decorator';
import { UsersService } from 'src/users/users.service';
import { SessionsService } from 'src/sessions/sessions.service';
import { SecurityService } from 'src/common/security/security.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class SigninHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly securityService: SecurityService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    email,
    password,
    ip,
    userAgent,
  }: {
    transactionId: string;
    email: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{ sessionId: string }> {
    const authentication = await this.usersService.findByEmailWithPassword({
      transactionId,
      email,
    });
    // ✅ Vérifier l'activité suspecte
    if (ip && (await this.securityService.isBlockedIP(ip))) {
      this.logger.warn('UNAUTHORIZED_ACCESS - Blocked IP attempted login', {
        transactionId,
        ip,
      });
      await this.securityService.logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        ip,
        userAgent: userAgent || 'unknown',
        details: { reason: 'Blocked IP attempted login', email },
        transactionId,
      });
      AuthenticationNotFoundException.throw(this.logger, { transactionId });
    }

    if (!authentication) {
      // ✅ Log tentative échouée
      this.logger.warn('LOGIN_FAILED - User not found', {
        transactionId,
        email,
      });
      if (ip) {
        await this.securityService.logSecurityEvent({
          type: 'LOGIN_FAILED',
          ip,
          userAgent: userAgent || 'unknown',
          details: { email, reason: 'User not found' },
          transactionId,
        });
      }
      AuthenticationNotFoundException.throw(this.logger, { transactionId });
    }

    if (authentication.isBanned) {
      this.logger.warn('LOGIN_FAILED - User is banned', {
        transactionId,
        email,
        userId: authentication.id,
      });
      AuthenticationNotFoundException.throw(this.logger, { transactionId });
    }

    const isPasswordMatch: boolean = await bcrypt.compare(
      password.concat(process.env.KEY_AUTHENTICATION),
      authentication.password,
    );

    if (!isPasswordMatch) {
      // ✅ Log tentative échouée
      this.logger.warn('LOGIN_FAILED - Invalid password', {
        transactionId,
        email,
      });
      if (ip) {
        await this.securityService.logSecurityEvent({
          type: 'LOGIN_FAILED',
          ip,
          userAgent: userAgent || 'unknown',
          details: { email, reason: 'Invalid password' },
          transactionId,
        });
      }
      AuthenticationBadPasswordException.throw(this.logger, { transactionId });
    }

    // ✅ Log connexion réussie
    this.logger.info('LOGIN_SUCCESS', {
      transactionId,
      userId: authentication.id,
    });
    if (ip) {
      await this.securityService.logSecurityEvent({
        type: 'LOGIN_SUCCESS',
        userId: authentication.id,
        ip,
        userAgent: userAgent || 'unknown',
        details: { email },
        transactionId,
      });
    }

    const session = await this.sessionsService.createSession({
      transactionId,
      data: {
        userId: authentication.id,
        userAgent,
        ipAddress: ip,
      },
    });

    this.posthogService.capture(authentication.id, 'user_signed_in', {
      auth_type: 'EMAIL',
    });

    return { sessionId: session.sessionId };
  }
}
