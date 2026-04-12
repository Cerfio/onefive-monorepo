import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class CancelStartupInvitationHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    invitationId,
  }: {
    transactionId: string;
    userId: string;
    invitationId: string;
  }) {
    this.logger.info('Cancelling startup invitation', {
      transactionId,
      userId,
      invitationId,
    });

    // Récupérer le profileId depuis le userId
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found for user');
    }

    const profileId = profile.id;

    // Vérifier que l'invitation existe et est PENDING
    const invitation = await this.prisma.startupInvitation.findUnique({
      where: { id: invitationId },
      include: { startup: { include: { members: true } } },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending invitations can be cancelled',
      );
    }

    // Vérifier que l'utilisateur est l'inviteur ou un admin de la startup
    const isInviter = invitation.invitedById === profileId;
    const isAdmin = invitation.startup.members.some(
      (m) =>
        m.profileId === profileId &&
        (m.role === 'SUPER_ADMIN' || m.role === 'ADMIN'),
    );

    if (!isInviter && !isAdmin) {
      throw new ForbiddenException(
        'Only the inviter or a startup admin can cancel this invitation',
      );
    }

    // Annuler l'invitation
    const cancelled = await this.prisma.startupInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'CANCELLED',
        respondedAt: new Date(),
        respondedById: profileId,
      },
    });

    this.logger.info('Startup invitation cancelled successfully', {
      transactionId,
      userId,
      invitationId,
      cancelledBy: isInviter ? 'inviter' : 'admin',
    });

    return {
      id: cancelled.id,
      status: cancelled.status,
      cancelledAt: cancelled.respondedAt?.toISOString(),
    };
  }
}
