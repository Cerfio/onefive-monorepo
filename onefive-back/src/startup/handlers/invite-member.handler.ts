import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { InviteMemberDto } from '../dto/invite-member.dto';
import {
  StartupMemberRoleType,
  NotificationType,
  NotificationCategory,
} from '@prisma/client';
import { NotificationService } from '../../notification/notification.service';
import { EmailService } from '../../email/email.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class InviteMemberHandler {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    startupId,
    payload,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    payload: InviteMemberDto;
  }) {
    this.logger.info('Inviting member', {
      transactionId,
      userId,
      startupId,
      payload,
    });

    // 1. Check permissions (Admin/SuperAdmin)
    const currentUserMember = await this.prisma.startupMember.findFirst({
      where: {
        startupId,
        profile: { userId },
      },
      include: { profile: true },
    });

    if (
      !currentUserMember ||
      (currentUserMember.role !== StartupMemberRoleType.SUPER_ADMIN &&
        currentUserMember.role !== StartupMemberRoleType.ADMIN)
    ) {
      throw new ForbiddenException('Only admins can invite members');
    }

    const requesterProfileId = currentUserMember.profileId;

    // Get startup info
    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    // 2. Logic based on input (ProfileId vs Email)
    if (payload.profileId) {
      // CASE 1: Existing Profile - Send invitation notification
      const profile = await this.prisma.profile.findUnique({
        where: { id: payload.profileId },
      });

      if (!profile) throw new NotFoundException('Profile not found');

      // Check if already member
      const existingMember = await this.prisma.startupMember.findUnique({
        where: {
          profileId_startupId: {
            profileId: payload.profileId,
            startupId,
          },
        },
      });

      if (existingMember) {
        throw new BadRequestException(
          'User is already a member of this startup',
        );
      }

      // Check if invitation already exists
      const existingInvitation = await this.prisma.startupInvitation.findFirst({
        where: {
          startupId,
          invitedProfileId: payload.profileId,
          status: 'PENDING',
        },
      });

      if (existingInvitation) {
        throw new BadRequestException(
          'An invitation is already pending for this user',
        );
      }

      // Create invitation
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await this.prisma.startupInvitation.create({
        data: {
          startupId,
          invitedProfileId: payload.profileId,
          position: payload.position,
          equity: 0, // Members don't get equity
          role: payload.role,
          invitedById: requesterProfileId,
          message: payload.message,
          expiresAt,
          status: 'PENDING',
        },
      });

      // Create INVITATION Notification with actions
      await this.notificationService.create({
        profileId: payload.profileId,
        type: NotificationType.STARTUP_INVITATION,
        category: NotificationCategory.INVITATIONS,
        title: 'Invitation to join a startup',
        message: `You have been invited to join ${startup.name} as ${payload.position}.`,
        actorId: requesterProfileId,
        entityId: invitation.id,
        entityType: 'STARTUP_INVITATION',
        data: {
          invitationId: invitation.id,
          startupId: startupId,
          startupName: startup.name,
          position: payload.position,
          actions: ['accept', 'decline'],
        },
      });

      this.posthogService.capture(userId, 'startup_member_invited', {
        startup_id: startupId,
      });

      return { status: 'INVITED', invitationId: invitation.id };
    } else if (payload.email) {
      // CASE 2: Invitation by Email

      // Check if email already has pending invitation
      const existingInvitation = await this.prisma.startupInvitation.findFirst({
        where: {
          startupId,
          email: payload.email,
          status: 'PENDING',
        },
      });

      if (existingInvitation) {
        throw new BadRequestException(
          'An invitation is already pending for this email',
        );
      }

      // Get requester profile info for email
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { id: requesterProfileId },
      });

      if (!requesterProfile) {
        throw new NotFoundException('Requester profile not found');
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await this.prisma.startupInvitation.create({
        data: {
          startupId,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          position: payload.position,
          equity: 0, // Members don't get equity
          role: payload.role,
          invitedById: requesterProfileId,
          message: payload.message,
          expiresAt,
          status: 'PENDING',
        },
      });

      // Send email invitation
      const frontendUrl = process.env.FRONTEND_URL || 'https://app.onefive.com';
      const acceptUrl = `${frontendUrl}/startup/invitations/${invitation.id}/accept`;
      const declineUrl = `${frontendUrl}/startup/invitations/${invitation.id}/decline`;

      try {
        await this.emailService.sendEmail({
          to: payload.email,
          type: 'member-invitation',
          payload: {
            inviterName: `${requesterProfile.firstName} ${requesterProfile.lastName}`,
            startupName: startup.name,
            startupLogo: startup.logo || undefined,
            position: payload.position,
            message: payload.message || '',
            acceptUrl,
            declineUrl,
          },
        });
        this.logger.info('Member invitation email sent', {
          transactionId,
          invitationId: invitation.id,
          email: payload.email,
        });
      } catch (error) {
        this.logger.error('Failed to send member invitation email', {
          transactionId,
          invitationId: invitation.id,
          error: error.message,
        });
        // Don't throw - invitation is created, email can be retried later
      }

      this.posthogService.capture(userId, 'startup_member_invited', {
        startup_id: startupId,
      });

      return { status: 'EMAIL_SENT', invitationId: invitation.id };
    } else {
      throw new BadRequestException(
        'Either profileId or email must be provided',
      );
    }
  }
}
