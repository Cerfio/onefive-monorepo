import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { PostHogService } from 'src/posthog/posthog.service';
import { StartupMemberRoleType } from '@prisma/client';

@Injectable()
export class CancelInvitationHandler {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    startupId,
    invitationId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    invitationId: string;
  }) {
    this.logger.info('Cancelling startup invitation', {
      transactionId,
      userId,
      startupId,
      invitationId,
    });

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
        'Only admins can cancel invitations',
      );
    }

    const invitation = await this.prisma.startupInvitation.findFirst({
      where: {
        id: invitationId,
        startupId,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw new ForbiddenException(
        'Only pending invitations can be cancelled',
      );
    }

    await this.prisma.startupInvitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' },
    });

    this.posthogService.capture(userId, 'startup_invitation_cancelled', {
      startup_id: startupId,
      invitation_id: invitationId,
    });

    return { status: 'CANCELLED', invitationId };
  }
}
