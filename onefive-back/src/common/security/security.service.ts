import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../logger/logger.decorator';

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SIGNUP_ATTEMPT'
  | 'PASSWORD_RESET_REQUEST'
  | 'UNAUTHORIZED_ACCESS';

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip: string;
  userAgent: string;
  details: any;
  transactionId?: string;
}

@Injectable()
export class SecurityService {
  private static readonly FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;
  private static readonly MAX_FAILED_LOGIN_ATTEMPTS = 5;
  private static readonly DEFAULT_BLOCK_DURATION_MS = 30 * 60 * 1000;

  private readonly failedAttempts = new Map<
    string,
    { count: number; firstFailedAt: number; blockedUntil?: number }
  >();

  constructor(@Inject('Logger') private readonly logger: LogService) {}

  @Log()
  async logSecurityEvent({
    type,
    userId,
    ip,
    userAgent,
    details,
    transactionId,
  }: SecurityEvent) {
    // ✅ Log structuré pour monitoring
    this.logger.warn('Security Event', {
      type,
      userId,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      transactionId,
      details,
    });

    const now = Date.now();
    const state = this.failedAttempts.get(ip) ?? {
      count: 0,
      firstFailedAt: now,
      blockedUntil: undefined,
    };

    if (type === 'LOGIN_FAILED') {
      if (now - state.firstFailedAt > SecurityService.FAILED_LOGIN_WINDOW_MS) {
        state.count = 0;
        state.firstFailedAt = now;
      }
      state.count += 1;

      if (state.count >= SecurityService.MAX_FAILED_LOGIN_ATTEMPTS) {
        state.blockedUntil = now + SecurityService.DEFAULT_BLOCK_DURATION_MS;
        this.logger.warn('IP temporarily blocked after failed logins', {
          ip,
          blockedUntil: new Date(state.blockedUntil).toISOString(),
          count: state.count,
        });
      }

      this.failedAttempts.set(ip, state);
    }

    if (type === 'LOGIN_SUCCESS') {
      this.failedAttempts.delete(ip);
    }
  }

  @Log()
  async checkSuspiciousActivity(ip: string, userId?: string): Promise<boolean> {
    const state = this.failedAttempts.get(ip);
    if (!state) return true;

    const now = Date.now();
    if (state.blockedUntil && state.blockedUntil > now) {
      return false;
    }

    if (now - state.firstFailedAt > SecurityService.FAILED_LOGIN_WINDOW_MS) {
      this.failedAttempts.delete(ip);
      return true;
    }

    return state.count < SecurityService.MAX_FAILED_LOGIN_ATTEMPTS;
  }

  @Log()
  async getClientInfo(
    request: any,
  ): Promise<{ ip: string; userAgent: string }> {
    // ✅ Extraire l'IP réelle (derrière proxy/load balancer)
    const ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown';

    const userAgent = request.headers['user-agent'] || 'unknown';

    return { ip, userAgent };
  }

  @Log()
  async isBlockedIP(ip: string): Promise<boolean> {
    const state = this.failedAttempts.get(ip);
    if (!state?.blockedUntil) {
      return false;
    }

    const now = Date.now();
    if (state.blockedUntil <= now) {
      this.failedAttempts.delete(ip);
      return false;
    }

    return true;
  }

  @Log()
  async blockIP(ip: string, reason: string, duration?: number): Promise<void> {
    const now = Date.now();
    const blockMs = duration ?? SecurityService.DEFAULT_BLOCK_DURATION_MS;
    const state = this.failedAttempts.get(ip) ?? {
      count: SecurityService.MAX_FAILED_LOGIN_ATTEMPTS,
      firstFailedAt: now,
    };

    state.blockedUntil = now + blockMs;
    this.failedAttempts.set(ip, state);

    await this.logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      ip,
      userAgent: 'system',
      details: {
        reason: `IP blocked: ${reason}`,
        durationMs: blockMs,
        blockedUntil: new Date(state.blockedUntil).toISOString(),
      },
    });
  }
}
