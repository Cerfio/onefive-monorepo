import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminUpdateProfileHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    adminUserId,
    firstName,
    lastName,
    currentPassword,
    newPassword,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    adminUserId: string;
    firstName?: string;
    lastName?: string;
    currentPassword?: string;
    newPassword?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const before = await this.adminService.getAdminUserById(adminUserId);
    const updated = await this.adminService.updateAdminProfile({
      adminUserId,
      firstName,
      lastName,
      currentPassword,
      newPassword,
    });

    const changes: Record<string, { before: unknown; after: unknown }> = {};
    if ((before?.firstName ?? null) !== (updated.firstName ?? null)) {
      changes.firstName = { before: before?.firstName ?? null, after: updated.firstName ?? null };
    }
    if ((before?.lastName ?? null) !== (updated.lastName ?? null)) {
      changes.lastName = { before: before?.lastName ?? null, after: updated.lastName ?? null };
    }
    if (newPassword) {
      changes.password = { before: 'hidden', after: 'updated' };
    }

    await this.adminService.createAuditLog({
      adminUserId,
      action: 'admin.auth.profile.update',
      resourceType: 'admin_user',
      resourceId: adminUserId,
      metadata: {
        transactionId,
        changedFields: Object.keys(changes),
        changes: JSON.parse(JSON.stringify(changes)) as Prisma.InputJsonValue,
      },
      ipAddress,
      userAgent,
    });

    return updated;
  }
}
