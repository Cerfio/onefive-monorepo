import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminRevokeInvitationHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    actorAdminUserId,
    invitationId,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    actorAdminUserId: string;
    invitationId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.adminService.requireSuperAdmin(actorAdminUserId);
    const invitationBefore =
      await this.adminService.getAdminInvitationForAuditById(invitationId);
    const invitation = await this.adminService.revokeInvitation(invitationId);

    await this.adminService.createAuditLog({
      adminUserId: actorAdminUserId,
      action: 'admin.invitation.revoke',
      resourceType: 'admin_invitation',
      resourceId: invitationId,
      metadata: {
        transactionId,
        invitationId,
        email: invitation.email,
        previousStatus: invitationBefore?.status ?? null,
        status: invitation.status,
        expiresAt: invitationBefore?.expiresAt ?? null,
        roleKey: invitationBefore?.role?.key ?? null,
        roleName: invitationBefore?.role?.name ?? null,
        invitedByAdminId: invitationBefore?.invitedBy?.id ?? null,
        invitedByEmail: invitationBefore?.invitedBy?.email ?? null,
        acceptedByAdminId: invitationBefore?.acceptedBy?.id ?? null,
        acceptedByEmail: invitationBefore?.acceptedBy?.email ?? null,
      },
      ipAddress,
      userAgent,
    });

    return invitation;
  }
}
