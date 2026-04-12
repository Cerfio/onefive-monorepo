import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminBulkBanUsersHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    userIds,
    isBanned,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    userIds: string[];
    isBanned: boolean;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const beforeUsers = await this.adminService.getUsersForBulkAudit(userIds);
    const byId = new Map(beforeUsers.map((user) => [user.id, user]));
    const result = await this.adminService.bulkBanUsers(userIds, isBanned);
    const targets = userIds.map((userId) => {
      const user = byId.get(userId);
      return {
        userId,
        email: user?.email ?? null,
        profileId: user?.profile?.id ?? null,
        firstName: user?.profile?.firstName ?? null,
        lastName: user?.profile?.lastName ?? null,
        previousIsBanned: user?.isBanned ?? null,
        isBanned,
      };
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: isBanned ? 'admin.users.bulk-ban' : 'admin.users.bulk-unban',
      resourceType: 'user',
      metadata: {
        transactionId,
        requestedCount: userIds.length,
        updatedCount: result.count,
        userIds,
        targets,
      },
      ipAddress,
      userAgent,
    });

    return result;
  }
}
