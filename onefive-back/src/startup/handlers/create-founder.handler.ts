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
import { CreateFounderDto } from '../dto/create-founder.dto';
import {
  StartupMemberRoleType,
  NotificationType,
  NotificationCategory,
} from '@prisma/client';
import { NotificationService } from '../../notification/notification.service';
import { ProfileRelationshipsService } from '../../profile-relationships/profile-relationships.service';
import { EmailService } from '../../email/email.service';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreateFounderHandler {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly notificationService: NotificationService,
    private readonly profileRelationshipsService: ProfileRelationshipsService,
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
    payload: CreateFounderDto;
  }) {
    this.logger.info('Adding founder', {
      transactionId,
      userId,
      startupId,
      payload,
    });

    // 1. Check permissions (Admin/SuperAdmin) and get Requester Profile
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
      throw new ForbiddenException('Only admins can add founders');
    }

    const requesterProfileId = currentUserMember.profileId;

    // 2. Validate equity
    const currentMembers = await this.prisma.startupMember.findMany({
      where: { startupId },
    });

    // Also check pending invitations for equity
    const pendingInvitations = await this.prisma.startupInvitation.findMany({
      where: {
        startupId,
        status: 'PENDING',
      },
    });

    // If adding by profileId, find any existing member to exclude their current
    // equity from the total (avoids double-counting if the member is being re-added
    // or if this call is mistakenly used for an update)
    const existingMember = payload.profileId
      ? currentMembers.find((m) => m.profileId === payload.profileId)
      : undefined;

    const currentTotalEquity = currentMembers.reduce(
      (sum, m) => sum + (m.equity || 0),
      0,
    );
    const pendingTotalEquity = pendingInvitations.reduce(
      (sum, i) => sum + (i.equity || 0),
      0,
    );

    // Subtract existing member's equity so we only check the delta
    const existingMemberEquity = existingMember?.equity ?? 0;
    const effectiveTotal =
      currentTotalEquity -
      existingMemberEquity +
      pendingTotalEquity +
      payload.equity;

    if (effectiveTotal > 100) {
      throw new BadRequestException(
        `Total equity cannot exceed 100%. Current: ${currentTotalEquity - existingMemberEquity}%, Pending: ${pendingTotalEquity}%, Requested: ${payload.equity}%`,
      );
    }

    // 3. Logic based on input (ProfileId vs Email)
    if (payload.profileId) {
      // CASE 1: Existing Profile
      const profile = await this.prisma.profile.findUnique({
        where: { id: payload.profileId },
        include: { user: true },
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

      // Add as Founder (Direct Member)
      await this.prisma.startupMember.create({
        data: {
          startupId,
          profileId: payload.profileId,
          position: payload.position,
          role: payload.role,
          equity: payload.equity,
          isFounder: true,
        },
      });

      // Update Startup updated date
      const startup = await this.prisma.startup.update({
        where: { id: startupId },
        data: { updatedAt: new Date() },
      });

      // Create Notification
      await this.notificationService.create({
        profileId: payload.profileId,
        type: 'STARTUP_UPDATE' as NotificationType, // Using closest matching type
        category: NotificationCategory.SYSTEM,
        title: 'You have been added as a founder',
        message: `You have been added as a founder of ${startup.name}.`,
        entityId: startupId,
        entityType: 'STARTUP',
        data: { startupId: startupId },
      });

      // Create Connection Request (Admin -> New Founder)
      try {
        await this.profileRelationshipsService.connectProfile({
          transactionId,
          userId: requesterProfileId, // Requester Profile ID
          profileId: payload.profileId, // Accepter Profile ID
        });
      } catch (error) {
        this.logger.warn(
          'Failed to create relationship request (probably already exists)',
          { transactionId, error },
        );
      }

      this.posthogService.capture(userId, 'startup_founder_added', { startup_id: startupId });

      return { status: 'ADDED', memberId: payload.profileId };
    } else if (payload.email) {
      // CASE 2: Invitation by Email

      // Get startup and requester info for email
      const startup = await this.prisma.startup.findUnique({
        where: { id: startupId },
      });

      if (!startup) {
        throw new NotFoundException('Startup not found');
      }

      const requesterProfile = await this.prisma.profile.findUnique({
        where: { id: requesterProfileId },
      });

      if (!requesterProfile) {
        throw new NotFoundException('Requester profile not found');
      }

      // Expiration: 7 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await this.prisma.startupInvitation.create({
        data: {
          startupId,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          position: payload.position,
          equity: payload.equity,
          role: payload.role,
          invitedById: requesterProfileId,
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
          type: 'founder-invitation',
          payload: {
            inviterName: `${requesterProfile.firstName} ${requesterProfile.lastName}`,
            startupName: startup.name,
            startupLogo: startup.logo || undefined,
            position: payload.position,
            equity: payload.equity,
            message: payload.message || '',
            acceptUrl,
            declineUrl,
          },
        });
        this.logger.info('Founder invitation email sent', {
          transactionId,
          invitationId: invitation.id,
          email: payload.email,
        });
      } catch (error) {
        this.logger.error('Failed to send founder invitation email', {
          transactionId,
          invitationId: invitation.id,
          error: error.message,
        });
        // Don't throw - invitation is created, email can be retried later
      }

      this.posthogService.capture(userId, 'startup_founder_added', { startup_id: startupId });

      return { status: 'INVITED', invitationId: invitation.id };
    } else {
      throw new BadRequestException(
        'Either profileId or email must be provided',
      );
    }
  }
}
