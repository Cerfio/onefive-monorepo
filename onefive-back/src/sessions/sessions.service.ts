import { Inject, Injectable } from '@nestjs/common';
import { Prisma, Session } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { GeolocationService } from 'src/common/geolocation/geolocation.service';
import { EmailService } from 'src/email/email.service';
import * as crypto from 'crypto';
import {
  CreateSessionException,
  GetSessionException,
  UpdateSessionException,
  DeleteSessionException,
  SessionNotFoundException,
  SessionRevokedException,
  SessionExpiredException,
} from './sessions.exception';
import { Log } from 'src/common/logger/logger.decorator';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly geolocationService: GeolocationService,
    private readonly emailService: EmailService,
  ) {}

  private async generateUniqueSessionId(): Promise<string> {
    let sessionId;
    let exists = true;
    do {
      sessionId = crypto.randomUUID().replace(/-/g, '');
      const session = await this.prisma.session.findUnique({
        where: { sessionId },
      });
      exists = session != null;
    } while (exists);
    return sessionId;
  }

  private async generateToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  private parseDeviceInfo(userAgent: string): string {
    if (!userAgent) return 'Web Browser';

    const ua = userAgent.toLowerCase();

    // Browser detection (order matters - Chrome before Safari, Edge before Chrome)
    let browser = 'Web Browser';
    if (ua.includes('edg') || ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome'))
      browser = 'Safari';
    else if (ua.includes('opera')) browser = 'Opera';

    // Device detection
    let device = 'Desktop';
    if (
      ua.includes('mobile') ||
      (ua.includes('android') && ua.includes('mobile'))
    ) {
      device = 'Mobile';
    } else if (
      ua.includes('tablet') ||
      (ua.includes('android') && !ua.includes('mobile'))
    ) {
      device = 'Tablet';
    } else {
      // Desktop OS detection
      if (
        ua.includes('macintosh') ||
        ua.includes('mac os') ||
        ua.includes('macos')
      ) {
        device = 'Mac';
      } else if (ua.includes('windows')) {
        device = 'Windows PC';
      } else if (
        ua.includes('linux') ||
        ua.includes('ubuntu') ||
        ua.includes('fedora')
      ) {
        device = 'Linux PC';
      } else if (ua.includes('cros')) {
        device = 'Chromebook';
      }
      // Keep 'Desktop' as default for unknown desktop OS
    }

    return `${device} • ${browser}`;
  }

  private generateFingerprint(userAgent: string, ipAddress: string): string {
    // Create a unique fingerprint based on user agent and IP
    const data = `${userAgent}:${ipAddress}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a STABLE device fingerprint (without timestamp)
   * Used for detecting new devices across sessions
   * Normalizes the userAgent to avoid false positives from browser updates
   */
  private generateDeviceFingerprint(userAgent: string): string {
    const normalized = this.normalizeUserAgent(userAgent);
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Normalize userAgent to reduce false positives from minor version changes
   * Example: "Chrome/120.0.6099.199" → "Chrome/120"
   */
  private normalizeUserAgent(userAgent: string): string {
    if (!userAgent) return 'unknown';
    // Remove minor/patch version numbers (keep major version)
    // "Chrome/120.0.6099.199" → "Chrome/120"
    // "Safari/17.2.1" → "Safari/17"
    return userAgent.replace(/\/(\d+)\.\d+[\.\d]*/g, '/$1');
  }

  /**
   * Check if this is a new device for the user.
   * Returns true only when the user has OTHER sessions (from different devices)
   * and this device is new. Does NOT return true for first-ever sign-in (signup).
   */
  private async isNewDevice(
    userId: string,
    deviceFingerprint: string,
  ): Promise<boolean> {
    const [sessionWithSameDevice, totalSessionsCount] = await Promise.all([
      this.prisma.session.findFirst({
        where: {
          userId,
          deviceFingerprint,
          isRevoked: false,
        },
        select: { id: true },
      }),
      this.prisma.session.count({
        where: { userId, isRevoked: false },
      }),
    ]);
    // Ne pas envoyer l'email "new device" au signup (première connexion)
    if (totalSessionsCount === 0) return false;
    return !sessionWithSameDevice;
  }

  /**
   * Send email notification for new device login
   * Non-blocking: errors are logged but don't fail the login
   */
  private async sendNewDeviceEmail({
    transactionId,
    userId,
    deviceInfo,
    location,
    ipAddress,
  }: {
    transactionId: string;
    userId: string;
    deviceInfo: string;
    location: string;
    ipAddress: string;
  }): Promise<void> {
    try {
      // Get user email and name
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          profile: {
            select: { firstName: true },
          },
        },
      });

      if (!user?.email) {
        this.logger.warn('Cannot send new device email: user email not found', {
          transactionId,
          userId,
        });
        return;
      }

      const firstName = user.profile?.firstName || 'there';
      const loginTime = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });

      await this.emailService.sendEmail({
        to: user.email,
        type: 'new-device-login',
        payload: {
          firstName,
          userEmail: user.email,
          deviceInfo,
          location,
          ipAddress,
          loginTime,
          sessionsUrl: `${(process.env.FRONTEND_URL || '').replace(/\/$/, '')}/settings/sessions`,
        },
      });

      this.logger.info('New device login email sent', {
        transactionId,
        userId,
        deviceInfo,
        location,
      });
    } catch (error) {
      // Non-blocking: log error but don't fail the login
      this.logger.error('Failed to send new device login email', {
        transactionId,
        userId,
        error: error.message,
      });
    }
  }

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: {
      userId: string;
      userAgent?: string;
      ipAddress?: string;
      isOtpOnlySession?: boolean;
      expiresAt?: Date;
    };
  }): Promise<Session> {
    try {
      const sessionId = await this.generateUniqueSessionId();
      const deviceInfo = data.userAgent
        ? this.parseDeviceInfo(data.userAgent)
        : '';
      const fingerprint = this.generateFingerprint(
        data.userAgent || '',
        data.ipAddress || '',
      );

      // Generate stable device fingerprint for new device detection
      const deviceFingerprint = this.generateDeviceFingerprint(
        data.userAgent || '',
      );

      // Check if this is a new device BEFORE creating the session
      const isNewDeviceLogin = await this.isNewDevice(
        data.userId,
        deviceFingerprint,
      );

      // Get location from IP address
      const location = data.ipAddress
        ? await this.geolocationService.getLocationFromIP(data.ipAddress)
        : 'Unknown Location';

      // Create the session
      const session = await this.prisma.session.create({
        data: {
          fingerprint,
          deviceFingerprint,
          deviceInfo,
          userAgent: data.userAgent || '',
          ipAddress: data.ipAddress || '',
          location,
          sessionId,
          token: await this.generateToken(),
          isOtpOnlySession: data.isOtpOnlySession ?? false,
          expiresAt:
            data.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
          user: {
            connect: {
              id: data.userId,
            },
          },
          isRevoked: false,
        } as any, // Temporary fix for Prisma type generation issue
      });

      // Send new device email notification (non-blocking)
      if (isNewDeviceLogin) {
        this.sendNewDeviceEmail({
          transactionId,
          userId: data.userId,
          deviceInfo,
          location,
          ipAddress: data.ipAddress || 'Unknown',
        }).catch((error) => {
          // Already logged inside sendNewDeviceEmail, this is just a safety catch
          this.logger.warn('New device email promise rejected', {
            transactionId,
            error: error?.message,
          });
        });
      }

      return session;
    } catch (error) {
      CreateSessionException.throw(this.logger, {
        transactionId,
        error: error.message,
      });
    }
  }

  @Log()
  async get({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.SessionWhereUniqueInput;
  }): Promise<Session> {
    try {
      return this.prisma.session.findUnique({
        where,
      });
    } catch (error) {
      GetSessionException.throw(this.logger, {
        transactionId,
        error: error.message,
      });
    }
  }

  @Log()
  async update({
    transactionId,
    where,
    data,
  }: {
    transactionId: string;
    where: Prisma.SessionWhereUniqueInput;
    data: Prisma.SessionUpdateInput;
  }): Promise<Session> {
    try {
      return this.prisma.session.update({
        where,
        data,
      });
    } catch (error) {
      UpdateSessionException.throw(this.logger, {
        transactionId,
        error: error.message,
      });
    }
  }

  @Log()
  async delete({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.SessionWhereUniqueInput;
  }): Promise<Session> {
    try {
      return this.prisma.session.delete({
        where,
      });
    } catch (error) {
      DeleteSessionException.throw(this.logger, {
        transactionId,
        error: error.message,
      });
    }
  }

  @Log()
  async createSession({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: {
      userId: string;
      userAgent?: string;
      ipAddress?: string;
      isOtpOnlySession?: boolean;
      expiresAt?: Date;
    };
  }): Promise<Session> {
    try {
      const session = await this.create({
        transactionId,
        data: {
          userId: data.userId,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          isOtpOnlySession: data.isOtpOnlySession,
          expiresAt: data.expiresAt,
        },
      });
      const hash = crypto
        .createHmac('sha256', process.env.SESSION_SECRET)
        .update(session.sessionId)
        .digest('hex');

      return {
        ...session,
        sessionId: `${hash}${session.sessionId}`,
      };
    } catch (error) {
      CreateSessionException.throw(this.logger, {
        transactionId,
        error: error.message,
      });
    }
  }
  @Log()
  async validateSession({
    transactionId,
    sessionId,
  }: {
    transactionId: string;
    sessionId: string;
  }): Promise<Session> {
    const uuidLength = 36 - 4; // 36 is the length of a uuid, 4 is the length of the hyphens
    const uuid = sessionId.slice(-uuidLength);
    const receivedHash = sessionId.slice(0, -uuidLength);
    const calculatedHash = crypto
      .createHmac('sha256', process.env.SESSION_SECRET)
      .update(uuid)
      .digest('hex');

    if (receivedHash !== calculatedHash) {
      SessionNotFoundException.throw(this.logger, { transactionId });
    }
    const session = await this.get({
      transactionId,
      where: {
        sessionId: uuid,
      },
    });

    if (!session) {
      SessionNotFoundException.throw(this.logger, { transactionId });
    }

    if (session.isRevoked) {
      SessionRevokedException.throw(this.logger, { transactionId });
    }

    if (
      new Date().getTime() - session.lastUsage.getTime() >
      90 * 24 * 60 * 60 * 1000
    ) {
      // Future: déplacer vers table expired_sessions avant suppression
      SessionExpiredException.throw(this.logger, { transactionId });
    }

    await this.update({
      transactionId,
      where: {
        id: session.id,
      },
      data: {
        lastUsage: new Date(),
      },
    });
    return session;
  }

  /**
   * Safe select for listing sessions — excludes sensitive fields (token, fingerprint)
   */
  private static readonly SAFE_SESSION_SELECT = {
    id: true,
    sessionId: true, // needed internally for current session comparison
    userId: true,
    deviceInfo: true,
    ipAddress: true,
    location: true,
    userAgent: true,
    lastUsage: true,
    createdAt: true,
    isRevoked: true,
    isOtpOnlySession: true,
    expiresAt: true,
    // ❌ token: NEVER expose
    // ❌ fingerprint: NEVER expose
  } as const;

  @Log()
  async listActiveSessions({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }): Promise<
    Omit<Session, 'token' | 'fingerprint' | 'updatedAt' | 'deviceFingerprint'>[]
  > {
    try {
      return await this.prisma.session.findMany({
        where: {
          userId,
          isRevoked: false,
          isOtpOnlySession: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        select: SessionsService.SAFE_SESSION_SELECT,
        orderBy: {
          lastUsage: 'desc',
        },
      });
    } catch (error) {
      GetSessionException.throw(this.logger, {
        transactionId,
        error: error.message,
      });
    }
  }

  @Log()
  async revokeSession({
    transactionId,
    userId,
    sessionDatabaseId,
  }: {
    transactionId: string;
    userId: string;
    sessionDatabaseId: string;
  }): Promise<Session> {
    try {
      // First check if the session belongs to the user
      const session = await this.prisma.session.findFirst({
        where: {
          id: sessionDatabaseId,
          userId,
          isRevoked: false,
        },
      });

      if (!session) {
        SessionNotFoundException.throw(this.logger, {
          transactionId,
          sessionDatabaseId,
        });
      }

      return await this.prisma.session.update({
        where: {
          id: sessionDatabaseId,
        },
        data: {
          isRevoked: true,
        },
      });
    } catch (error) {
      UpdateSessionException.throw(this.logger, {
        transactionId,
        error: error.message,
      });
    }
  }

  /**
   * Obtenir le profileId depuis un sessionId
   * Utilisé pour les WebSockets où on veut exposer profileId et non userId
   */
  @Log()
  async getProfileIdFromSession(sessionId: string): Promise<string | null> {
    try {
      const session = await this.validateSession({
        sessionId,
        transactionId: 'ws-auth',
      });

      if (!session || !session.userId) {
        return null;
      }

      // Récupérer le profileId
      const profile = await this.prisma.profile.findFirst({
        where: { userId: session.userId },
        select: { id: true },
      });

      return profile?.id || null;
    } catch (error) {
      return null;
    }
  }
}
