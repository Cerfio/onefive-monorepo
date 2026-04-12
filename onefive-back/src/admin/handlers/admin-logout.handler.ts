import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminLogoutHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    adminUserId,
    token,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    adminUserId: string;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const existingSession =
      await this.adminService.getAdminSessionForAudit(token);
    await this.adminService.revokeAdminSession(token);
    await this.adminService.createAuditLog({
      adminUserId,
      action: 'admin.auth.logout',
      resourceType: 'admin_user',
      resourceId: adminUserId,
      metadata: {
        transactionId,
        sessionFound: Boolean(existingSession),
        sessionId: existingSession?.id ?? null,
        previousIsRevoked: existingSession?.isRevoked ?? null,
        sessionExpiresAt: existingSession?.expiresAt ?? null,
        sessionLastUsageAt: existingSession?.lastUsage ?? null,
        sessionCreatedAt: existingSession?.createdAt ?? null,
        sessionTokenSuffix: token.slice(-8),
      },
      ipAddress,
      userAgent,
    });
  }
}
