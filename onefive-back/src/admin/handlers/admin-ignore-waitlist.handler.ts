import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminIgnoreWaitlistHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    profileId,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    profileId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const profileInfo =
      await this.adminService.getProfileWithUserForAudit(profileId);

    await this.adminService.ignoreWaitlistEntry(profileId);

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.waitlist.ignore',
      resourceType: 'profile',
      resourceId: profileId,
      metadata: profileInfo
        ? {
            transactionId,
            profileId,
            userId: profileInfo.userId,
            email: profileInfo.email,
            firstName: profileInfo.firstName,
            lastName: profileInfo.lastName,
          }
        : { transactionId, profileId },
      ipAddress,
      userAgent,
    });
  }
}
