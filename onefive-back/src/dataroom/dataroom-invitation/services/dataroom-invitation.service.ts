import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailService } from '../../../email/email.service';
import { NotificationHelperService } from '../../../notification/notification-helper.service';

@Injectable()
export class DataroomInvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationHelper: NotificationHelperService,
  ) {}

  async create({
    transactionId,
    dataroomId,
    userId,
    groupId,
    profileId,
    existingUser,
    newUser,
  }: {
    transactionId: string;
    dataroomId: string;
    userId: string;
    groupId: string;
    profileId: string;
    existingUser?: {
      profileInvitedId: string;
    };
    newUser?: {
      email: string;
      firstname: string;
      lastname: string;
      dataroomName: string;
    };
  }) {
    let existingUserInvitationId: string | undefined;
    let newUserInvitationId: string | undefined;

    if (existingUser) {
      const existingUserInvitation =
        await this.prisma.existingUserInvitation.create({
          data: {
            profileId: existingUser.profileInvitedId,
            dataroomId,
          },
        });
      existingUserInvitationId = existingUserInvitation.id;
    }

    if (newUser) {
      const newUserInvitation = await this.prisma.newUserInvitation.create({
        data: {
          email: newUser.email,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          dataroomName: newUser.dataroomName,
          dataroomId,
        },
      });
      newUserInvitationId = newUserInvitation.id;
    }

    const invitation = await this.prisma.dataroomInvitation.create({
      data: {
        dataroomId,
        groupId,
        createdBy: userId,
        status: 'PENDING',
        existingUserInvitationId,
        newUserInvitationId,
      },
    });

    // Notification in-app pour un utilisateur déjà inscrit qui est invité.
    if (existingUser) {
      try {
        const inviterProfile = await this.prisma.profile.findUnique({
          where: { userId },
          select: { id: true, firstName: true, lastName: true },
        });
        const dataroom = await this.prisma.dataroom.findUnique({
          where: { id: dataroomId },
          select: { startup: { select: { name: true } } },
        });
        const inviterName =
          inviterProfile?.firstName && inviterProfile?.lastName
            ? `${inviterProfile.firstName} ${inviterProfile.lastName}`
            : 'Un membre';
        await this.notificationHelper.notifyDataroomInvitation({
          invitedProfileId: existingUser.profileInvitedId,
          inviterProfileId: inviterProfile?.id,
          inviterName,
          dataroomId,
          dataroomName: dataroom?.startup?.name || 'une dataroom',
        });
      } catch {
        // notification non bloquante
      }
    }

    if (newUser) {
      const inviterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { firstName: true, lastName: true },
      });
      const dataroom = await this.prisma.dataroom.findUnique({
        where: { id: dataroomId },
        select: {
          startup: {
            select: {
              logo: true,
            },
          },
        },
      });

      const inviterName =
        inviterProfile?.firstName && inviterProfile?.lastName
          ? `${inviterProfile.firstName} ${inviterProfile.lastName}`
          : 'A team member';

      const frontendUrl = process.env.FRONTEND_URL || '';
      const acceptUrl = `${frontendUrl.replace(/\/$/, '')}/register?dataroomInvitation=${invitation.id}`;

      this.emailService
        .sendEmail({
          to: newUser.email,
          type: 'dataroom-invitation',
          payload: {
            firstname: newUser.firstname,
            inviterName,
            dataroomName: newUser.dataroomName,
            startupLogo: dataroom?.startup?.logo || undefined,
            acceptUrl,
          },
        })
        .catch(() => {});
    }

    return invitation;
  }

  async accept({
    transactionId,
    invitationId,
    dataroomId,
    userId,
    profileId,
  }: {
    transactionId: string;
    invitationId: string;
    dataroomId: string;
    userId: string;
    profileId: string;
  }) {
    const invitation = await this.prisma.dataroomInvitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: 'ACCEPTED',
      },
    });

    // Ajouter l'utilisateur au groupe via Member
    await this.prisma.member.create({
      data: {
        groupId: invitation.groupId,
        profileId: profileId,
        dataroomId: dataroomId,
      },
    });

    return invitation;
  }

  async decline({
    transactionId,
    invitationId,
    userId,
    profileId,
  }: {
    transactionId: string;
    invitationId: string;
    userId: string;
    profileId: string;
  }) {
    const invitation = await this.prisma.dataroomInvitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: 'DECLINED',
      },
    });

    return invitation;
  }

  async delete({
    transactionId,
    invitationId,
    userId,
    profileId,
  }: {
    transactionId: string;
    invitationId: string;
    userId: string;
    profileId: string;
  }) {
    await this.prisma.dataroomInvitation.delete({
      where: {
        id: invitationId,
      },
    });

    return { success: true };
  }
}
