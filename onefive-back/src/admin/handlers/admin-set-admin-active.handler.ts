import { BadRequestException, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminSetAdminActiveHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    targetAdminUserId,
    isActive,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    targetAdminUserId: string;
    isActive: boolean;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.adminService.requireSuperAdmin(actorAdminUserId);
    if (actorAdminUserId === targetAdminUserId && !isActive) {
      throw new BadRequestException('Cannot deactivate your own admin account');
    }

    const targetAdmin =
      await this.adminService.getAdminUserById(targetAdminUserId);
    const updated = await this.adminService.setAdminActive({
      adminUserId: targetAdminUserId,
      isActive,
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: isActive
        ? 'admin.admin_user.activate'
        : 'admin.admin_user.deactivate',
      resourceType: 'admin_user',
      resourceId: targetAdminUserId,
      metadata: {
        transactionId,
        previousIsActive: targetAdmin?.isActive,
        isActive,
        targetAdminEmail: targetAdmin?.email,
      },
      ipAddress,
      userAgent,
    });

    return updated;
  }
}
