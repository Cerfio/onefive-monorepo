import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminAcceptInvitationHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    token,
    password,
    firstName,
    lastName,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    token: string;
    password: string;
    firstName?: string;
    lastName?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const invitationBefore =
      await this.adminService.getAdminInvitationForAuditByToken(token);
    const adminUser = await this.adminService.acceptInvitation({
      token,
      password,
      firstName,
      lastName,
    });

    await this.adminService.createAuditLog({
      adminUserId: adminUser.id,
      action: 'admin.invitation.accept',
      resourceType: 'admin_user',
      resourceId: adminUser.id,
      metadata: {
        transactionId,
        adminEmail: adminUser.email,
        invitationId: invitationBefore?.id ?? null,
        invitationEmail: invitationBefore?.email ?? null,
        previousInvitationStatus: invitationBefore?.status ?? null,
        invitationStatus: 'ACCEPTED',
        invitationRoleKey: invitationBefore?.role?.key ?? null,
        invitationRoleName: invitationBefore?.role?.name ?? null,
        invitedByAdminId: invitationBefore?.invitedBy?.id ?? null,
        invitedByEmail: invitationBefore?.invitedBy?.email ?? null,
      },
      ipAddress,
      userAgent,
    });

    return adminUser;
  }
}
