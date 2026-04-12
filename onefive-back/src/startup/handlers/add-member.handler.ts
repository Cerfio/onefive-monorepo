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
import { AddMemberDto } from '../dto/add-member.dto';
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
export class AddMemberHandler {
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
    payload: AddMemberDto;
  }) {
    this.logger.info('Adding member to startup', {
      transactionId,
      userId,
      startupId,
      payload,
    });

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
      throw new ForbiddenException('Only admins can add members');
    }

    const requesterProfileId = currentUserMember.profileId;
    const isFounder = payload.isFounder === true;
    const equity = isFounder ? (payload.equity ?? 0) : 0;
    const role =
      payload.role ?? (isFounder ? StartupMemberRoleType.ADMIN : StartupMemberRoleType.MEMBER);

    if (equity > 0) {
      const currentMembers = await this.prisma.startupMember.findMany({
        where: { startupId },
      });

      const pendingInvitations = await this.prisma.startupInvitation.findMany({
        where: { startupId, status: 'PENDING' },
      });

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
      const existingMemberEquity = existingMember?.equity ?? 0;
      const effectiveTotal =
        currentTotalEquity - existingMemberEquity + pendingTotalEquity + equity;

      if (effectiveTotal > 100) {
        throw new BadRequestException(
          `Total equity cannot exceed 100%. Current: ${currentTotalEquity - existingMemberEquity}%, Pending: ${pendingTotalEquity}%, Requested: ${equity}%`,
        );
      }
    }

    if (payload.profileId) {
      const result = await this.addByProfileId({
        transactionId,
        startupId,
        requesterProfileId,
        profileId: payload.profileId,
        position: payload.position,
        role,
        equity,
        isFounder,
      });
      this.posthogService.capture(userId, 'startup_member_added', { startup_id: startupId });
      return result;
    } else if (payload.email) {
      const result = await this.inviteByEmail({
        transactionId,
        startupId,
        requesterProfileId,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        position: payload.position,
        role,
        equity,
        isFounder,
        message: payload.message,
      });
      this.posthogService.capture(userId, 'startup_member_added', { startup_id: startupId });
      return result;
    } else {
      throw new BadRequestException(
        'Either profileId or email must be provided',
      );
    }
  }

  private async addByProfileId({
    transactionId,
    startupId,
    requesterProfileId,
    profileId,
    position,
    role,
    equity,
    isFounder,
  }: {
    transactionId: string;
    startupId: string;
    requesterProfileId: string;
    profileId: string;
    position: string;
    role: StartupMemberRoleType;
    equity: number;
    isFounder: boolean;
  }) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const existingMember = await this.prisma.startupMember.findUnique({
      where: {
        profileId_startupId: { profileId, startupId },
      },
    });

    if (existingMember) {
      throw new BadRequestException(
        'User is already a member of this startup',
      );
    }

    if (isFounder) {
      await this.prisma.startupMember.create({
        data: {
          startupId,
          profileId,
          position,
          role,
          equity,
          isFounder: true,
        },
      });

      const startup = await this.prisma.startup.update({
        where: { id: startupId },
        data: { updatedAt: new Date() },
      });

      await this.notificationService.create({
        profileId,
        type: 'STARTUP_UPDATE' as NotificationType,
        category: NotificationCategory.SYSTEM,
        title: 'You have been added as a founder',
        message: `You have been added as a founder of ${startup.name}.`,
        entityId: startupId,
        entityType: 'STARTUP',
        data: { startupId },
      });

      try {
        await this.profileRelationshipsService.connectProfile({
          transactionId,
          userId: requesterProfileId,
          profileId,
        });
      } catch (error) {
        this.logger.warn(
          'Failed to create relationship request (probably already exists)',
          { transactionId, error },
        );
      }

      return { status: 'ADDED', memberId: profileId };
    } else {
      const existingInvitation =
        await this.prisma.startupInvitation.findFirst({
          where: { startupId, invitedProfileId: profileId, status: 'PENDING' },
        });

      if (existingInvitation) {
        throw new BadRequestException(
          'An invitation is already pending for this user',
        );
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await this.prisma.startupInvitation.create({
        data: {
          startupId,
          invitedProfileId: profileId,
          position,
          equity,
          role,
          invitedById: requesterProfileId,
          expiresAt,
          status: 'PENDING',
        },
      });

      const startup = await this.prisma.startup.findUnique({
        where: { id: startupId },
      });

      await this.notificationService.create({
        profileId,
        type: NotificationType.STARTUP_INVITATION,
        category: NotificationCategory.INVITATIONS,
        title: 'Invitation to join a startup',
        message: `You have been invited to join ${startup.name} as ${position}.`,
        actorId: requesterProfileId,
        entityId: invitation.id,
        entityType: 'STARTUP_INVITATION',
        data: {
          invitationId: invitation.id,
          startupId,
          startupName: startup.name,
          position,
          actions: ['accept', 'decline'],
        },
      });

      return { status: 'INVITED', invitationId: invitation.id };
    }
  }

  private async inviteByEmail({
    transactionId,
    startupId,
    requesterProfileId,
    email,
    firstName,
    lastName,
    position,
    role,
    equity,
    isFounder,
    message,
  }: {
    transactionId: string;
    startupId: string;
    requesterProfileId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    position: string;
    role: StartupMemberRoleType;
    equity: number;
    isFounder: boolean;
    message?: string;
  }) {
    const existingInvitation = await this.prisma.startupInvitation.findFirst({
      where: { startupId, email, status: 'PENDING' },
    });

    if (existingInvitation) {
      throw new BadRequestException(
        'An invitation is already pending for this email',
      );
    }

    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
    });
    if (!startup) throw new NotFoundException('Startup not found');

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
        email,
        firstName,
        lastName,
        position,
        equity,
        role,
        invitedById: requesterProfileId,
        message,
        expiresAt,
        status: 'PENDING',
      },
    });

    const frontendUrl =
      process.env.FRONTEND_URL || 'https://app.onefive.com';
    const acceptUrl = `${frontendUrl}/startup/invitations/${invitation.id}/accept`;
    const declineUrl = `${frontendUrl}/startup/invitations/${invitation.id}/decline`;

    const emailType = isFounder ? 'founder-invitation' : 'member-invitation';

    try {
      await this.emailService.sendEmail({
        to: email,
        type: emailType,
        payload: {
          inviterName: `${requesterProfile.firstName} ${requesterProfile.lastName}`,
          startupName: startup.name,
          startupLogo: startup.logo || undefined,
          position,
          equity,
          message: message || '',
          acceptUrl,
          declineUrl,
        },
      });
      this.logger.info('Invitation email sent', {
        transactionId,
        invitationId: invitation.id,
        email,
      });
    } catch (error) {
      this.logger.error('Failed to send invitation email', {
        transactionId,
        invitationId: invitation.id,
        error: (error as Error).message,
      });
    }

    return { status: 'EMAIL_SENT', invitationId: invitation.id };
  }
}
