import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { AdminService } from '../admin.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AdminCreateInvitationHandler {
  constructor(
    private readonly adminService: AdminService,
    private readonly emailService: EmailService,
  ) {}

  @Log()
  async execute({
    transactionId,
    adminUserId,
    email,
    roleKey,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    adminUserId: string;
    email: string;
    roleKey: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.adminService.requireSuperAdmin(adminUserId);

    const [invitation, inviter] = await Promise.all([
      this.adminService.createInvitation({ adminUserId, email, roleKey }),
      this.adminService.getAdminUserById(adminUserId),
    ]);

    await this.adminService.createAuditLog({
      adminUserId,
      action: 'admin.invitation.create',
      resourceType: 'admin_invitation',
      resourceId: invitation.id,
      metadata: {
        transactionId,
        invitationId: invitation.id,
        email: invitation.email,
        roleKey: invitation.role.key,
        roleName: invitation.role.name,
        status: 'PENDING',
        expiresAt: invitation.expiresAt,
        invitedByAdminId: adminUserId,
        invitedByEmail: inviter?.email ?? null,
      },
      ipAddress,
      userAgent,
    });

    const adminUrl = process.env.ADMIN_URL || 'https://admin.onefive.app';
    const acceptUrl = `${adminUrl}/accept-invitation?token=${invitation.token}`;
    const inviterName =
      inviter?.firstName && inviter?.lastName
        ? `${inviter.firstName} ${inviter.lastName}`
        : (inviter?.email ?? 'A team member');

    this.emailService
      .sendEmail({
        to: invitation.email,
        type: 'admin-invitation',
        payload: {
          inviterName,
          roleName: invitation.role.name,
          acceptUrl,
        },
      })
      .catch(() => {});

    return invitation;
  }
}
