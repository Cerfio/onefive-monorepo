import { BadRequestException, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminSetSuperAdminHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    targetAdminUserId,
    isSuperAdmin,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    targetAdminUserId: string;
    isSuperAdmin: boolean;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.adminService.requireSuperAdmin(actorAdminUserId);
    if (actorAdminUserId === targetAdminUserId && !isSuperAdmin) {
      throw new BadRequestException('Cannot remove your own superadmin access');
    }

    const targetAdmin =
      await this.adminService.getAdminUserById(targetAdminUserId);
    const updated = await this.adminService.setAdminSuperAdmin({
      adminUserId: targetAdminUserId,
      isSuperAdmin,
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: isSuperAdmin
        ? 'admin.admin_user.superadmin.grant'
        : 'admin.admin_user.superadmin.revoke',
      resourceType: 'admin_user',
      resourceId: targetAdminUserId,
      metadata: {
        transactionId,
        previousIsSuperAdmin: targetAdmin?.isSuperAdmin,
        isSuperAdmin,
        targetAdminEmail: targetAdmin?.email,
      },
      ipAddress,
      userAgent,
    });

    return updated;
  }
}
