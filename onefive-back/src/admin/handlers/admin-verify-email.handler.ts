import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminVerifyEmailHandler {
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
    const userDetail = await this.adminService.getUserDetail(targetUserId);
    const result = await this.adminService.verifyEmail(targetUserId);

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.user.email.verify',
      resourceType: 'user',
      resourceId: targetUserId,
      metadata: {
        transactionId,
        previousIsEmailVerified: userDetail?.isEmailVerified,
        isEmailVerified: result.isEmailVerified,
        targetEmail: result.email,
      },
      ipAddress,
      userAgent,
    });

    return result;
  }
}
