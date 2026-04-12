import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { randomBytes } from 'crypto';

/**
 * OAuthStateService manages CSRF protection for OAuth flows.
 *
 * Flow:
 * 1. Frontend calls GET /auth/oauth-url?provider=linkedin|google
 * 2. Backend generates a cryptographically random state, stores it in DB with TTL
 * 3. Frontend redirects user to OAuth provider with state in the URL
 * 4. After OAuth callback, frontend sends code + state to backend
 * 5. Backend validates state exists & is not expired, then deletes it (one-time use)
 */
@Injectable()
export class OAuthStateService {
  /** State tokens expire after 10 minutes */
  private static readonly STATE_TTL_MS = 10 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  /**
   * Generate a cryptographically random OAuth state token and store it in DB.
   * @returns The generated state string
   */
  async generateState(provider: string): Promise<string> {
    const state = randomBytes(32).toString('hex'); // 64-char hex string
    const expiresAt = new Date(Date.now() + OAuthStateService.STATE_TTL_MS);

    await this.prisma.oAuthState.create({
      data: {
        state,
        provider,
        expiresAt,
      },
    });

    this.logger.info('OAuth state generated', {
      provider,
      expiresAt: expiresAt.toISOString(),
    });

    return state;
  }

  /**
   * Validate an OAuth state token. Deletes it after validation (one-time use).
   * @returns true if valid, throws UnauthorizedException if invalid
   */
  async validateState(
    state: string,
    expectedProvider?: string,
  ): Promise<boolean> {
    const record = await this.prisma.oAuthState.findUnique({
      where: { state },
    });

    if (!record) {
      this.logger.warn('OAuth state not found (possible CSRF attack)', {
        state: state.substring(0, 8) + '...',
      });
      throw new UnauthorizedException('Invalid OAuth state. Please try again.');
    }

    // Check expiration
    if (record.expiresAt < new Date()) {
      // Delete expired state
      await this.prisma.oAuthState
        .delete({ where: { id: record.id } })
        .catch(() => {});
      this.logger.warn('OAuth state expired', { provider: record.provider });
      throw new UnauthorizedException('OAuth state expired. Please try again.');
    }

    // Check provider match if specified
    if (expectedProvider && record.provider !== expectedProvider) {
      this.logger.warn('OAuth state provider mismatch', {
        expected: expectedProvider,
        actual: record.provider,
      });
      throw new UnauthorizedException('Invalid OAuth state. Please try again.');
    }

    // Delete state (one-time use) — prevents replay attacks
    await this.prisma.oAuthState.delete({ where: { id: record.id } });

    this.logger.info('OAuth state validated successfully', {
      provider: record.provider,
    });
    return true;
  }

  /**
   * Clean up expired OAuth state tokens.
   * Should be called periodically (e.g., via cron job).
   */
  async cleanupExpiredStates(): Promise<number> {
    const result = await this.prisma.oAuthState.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    if (result.count > 0) {
      this.logger.info(`Cleaned up ${result.count} expired OAuth states`);
    }

    return result.count;
  }
}
