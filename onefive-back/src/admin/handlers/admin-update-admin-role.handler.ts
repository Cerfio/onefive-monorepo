import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminUpdateAdminRoleHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    targetAdminUserId,
    roleKey,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    targetAdminUserId: string;
    roleKey: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.adminService.requireSuperAdmin(actorAdminUserId);
    const targetAdmin = await this.adminService.getAdminUserById(targetAdminUserId);
    const updated = await this.adminService.setAdminRole({
      adminUserId: targetAdminUserId,
      roleKey,
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.admin_user.role.update',
      resourceType: 'admin_user',
      resourceId: targetAdminUserId,
      metadata: {
        transactionId,
        previousRoleKeys:
          targetAdmin?.roles?.map((entry) => entry.role.key) ?? [],
        roleKey,
        targetAdminEmail: targetAdmin?.email,
      },
      ipAddress,
      userAgent,
    });

    return updated;
  }
}
