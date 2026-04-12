import {
  Injectable,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { StartupMemberRoleType } from '@prisma/client';

@Injectable()
export class GetStartupInvitationsHandler {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    startupId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
  }) {
    const member = await this.prisma.startupMember.findFirst({
      where: {
        startupId,
        profile: { userId },
      },
    });

    if (
      !member ||
      (member.role !== StartupMemberRoleType.SUPER_ADMIN &&
        member.role !== StartupMemberRoleType.ADMIN)
    ) {
      throw new ForbiddenException(
        'Only admins can view pending invitations',
      );
    }

    const invitations = await this.prisma.startupInvitation.findMany({
      where: {
        startupId,
        status: 'PENDING',
      },
      include: {
        invitedProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: { select: { id: true } },
          },
        },
        invitedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map((inv) => ({
      id: inv.id,
      position: inv.position,
      role: inv.role,
      status: inv.status,
      firstName: inv.firstName,
      lastName: inv.lastName,
      createdAt: inv.createdAt.toISOString(),
      expiresAt: inv.expiresAt.toISOString(),
      invitedProfile: inv.invitedProfile
        ? {
            id: inv.invitedProfile.id,
            name: `${inv.invitedProfile.firstName} ${inv.invitedProfile.lastName}`,
            avatar: inv.invitedProfile.avatar?.id || null,
          }
        : null,
      invitedBy: {
        id: inv.invitedBy.id,
        name: `${inv.invitedBy.firstName} ${inv.invitedBy.lastName}`,
      },
    }));
  }
}
