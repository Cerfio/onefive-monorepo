import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminChangeWaitlistStatusHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    targetUserId,
    waitlistStatus,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    targetUserId: string;
    waitlistStatus: 'WAITING' | 'ACTIVE' | 'IGNORED';
    ipAddress?: string;
    userAgent?: string;
  }) {
    const userDetail = await this.adminService.getUserDetail(targetUserId);
    const result = await this.adminService.changeWaitlistStatus({
      userId: targetUserId,
      waitlistStatus,
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.user.waitlist.change',
      resourceType: 'user',
      resourceId: targetUserId,
      metadata: {
        transactionId,
        previousWaitlistStatus: userDetail?.profile?.waitlistStatus,
        waitlistStatus,
        targetEmail: userDetail?.email,
      },
      ipAddress,
      userAgent,
    });

    return result;
  }
}
