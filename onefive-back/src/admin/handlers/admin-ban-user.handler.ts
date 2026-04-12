import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminBanUserHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    targetUserId,
    isBanned,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    targetUserId: string;
    isBanned: boolean;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const userDetail = await this.adminService.getUserDetail(targetUserId);
    const user = await this.adminService.banUser({
      userId: targetUserId,
      isBanned,
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: isBanned ? 'admin.user.ban' : 'admin.user.unban',
      resourceType: 'user',
      resourceId: targetUserId,
      metadata: {
        transactionId,
        previousIsBanned: userDetail?.isBanned,
        isBanned,
        targetEmail: user.email,
      },
      ipAddress,
      userAgent,
    });

    return user;
  }
}
