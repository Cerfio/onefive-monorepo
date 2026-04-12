import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminToggleAmbassadorHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    targetUserId,
    isAmbassador,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    targetUserId: string;
    isAmbassador: boolean;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const userDetail = await this.adminService.getUserDetail(targetUserId);
    const result = await this.adminService.toggleAmbassador({
      userId: targetUserId,
      isAmbassador,
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: isAmbassador
        ? 'admin.user.ambassador.grant'
        : 'admin.user.ambassador.revoke',
      resourceType: 'user',
      resourceId: targetUserId,
      metadata: {
        transactionId,
        previousIsAmbassador: userDetail?.profile?.isAmbassador,
        isAmbassador,
        targetEmail: userDetail?.email,
      },
      ipAddress,
      userAgent,
    });

    return result;
  }
}
