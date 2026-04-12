import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminBulkDeleteUsersHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    userIds,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    userIds: string[];
    ipAddress?: string;
    userAgent?: string;
  }) {
    const usersToDelete = await this.adminService.getUsersForBulkAudit(userIds);
    const byId = new Map(usersToDelete.map((user) => [user.id, user]));
    const result = await this.adminService.bulkDeleteUsers(userIds);
    const deletedUsers = userIds.map((userId) => {
      const user = byId.get(userId);
      return {
        userId,
        email: user?.email ?? null,
        profileId: user?.profile?.id ?? null,
        firstName: user?.profile?.firstName ?? null,
        lastName: user?.profile?.lastName ?? null,
        isBanned: user?.isBanned ?? null,
        isEmailVerified: user?.isEmailVerified ?? null,
        waitlistStatus: user?.profile?.waitlistStatus ?? null,
        isAmbassador: user?.profile?.isAmbassador ?? null,
      };
    });

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.users.bulk-delete',
      resourceType: 'user',
      metadata: {
        transactionId,
        requestedCount: userIds.length,
        deletedCount: result.count,
        userIds,
        deletedUsers,
      },
      ipAddress,
      userAgent,
    });

    return result;
  }
}
