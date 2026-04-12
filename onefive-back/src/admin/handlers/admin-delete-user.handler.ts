import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminDeleteUserHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    targetUserId,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    targetUserId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const user = await this.adminService.deleteUser(targetUserId);

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.user.delete',
      resourceType: 'user',
      resourceId: targetUserId,
      metadata: { transactionId, email: user.email },
      ipAddress,
      userAgent,
    });

    return user;
  }
}
