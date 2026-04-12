import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../../startup/startup.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';
import { NotificationHelperService } from '../../notification/notification-helper.service';

@Injectable()
export class CreateStartupInvitationHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
    private readonly prisma: PrismaService,
    private readonly notificationHelper: NotificationHelperService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    data,
  }: {
    transactionId: string;
    userId: string;
    data: {
      profileId?: string; // Pour utilisateur existant
      email?: string; // Pour nouvel utilisateur
      firstName?: string;
      lastName?: string;
      position: string;
      equity: number;
      message?: string;
    };
  }) {
    this.logger.info('Creating startup invitation', {
      transactionId,
      userId,
      hasProfileId: !!data.profileId,
      hasEmail: !!data.email,
      position: data.position,
      equity: data.equity,
    });

    // Récupérer le profileId depuis le userId
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found for user');
    }

    const profileId = profile.id;

    // Vérifier les permissions de l'utilisateur
    const userStartups = await this.startupService.getUserStartups(userId);
    const targetStartup = userStartups.find(
      (s) => s.role === 'SUPER_ADMIN' || s.role === 'ADMIN',
    );

    if (!targetStartup) {
      throw new ForbiddenException(
        'User must be admin of a startup to send invitations',
      );
    }

    // Vérifier la limite d'invitations en cours (max 5)
    const pendingInvitations = await this.startupService.getPendingInvitations(
      targetStartup.id,
    );
    if (pendingInvitations.length >= 5) {
      throw new BadRequestException('Maximum 5 pending invitations allowed');
    }

    // Transaction to prevent race condition on equity allocation
    // Without this, two simultaneous requests could both pass the check
    // and create invitations that together exceed 100% equity
    const invitation = await this.prisma.$transaction(async (tx) => {
      // Calculate total equity: accepted members + pending invitations
      const [members, pendingInvites] = await Promise.all([
        tx.startupMember.findMany({
          where: { startupId: targetStartup.id },
          select: { equity: true },
        }),
        tx.startupInvitation.findMany({
          where: {
            startupId: targetStartup.id,
            status: 'PENDING',
            expiresAt: { gt: new Date() },
          },
          select: { equity: true },
        }),
      ]);

      const membersEquity = members.reduce((total, m) => total + m.equity, 0);
      const pendingEquity = pendingInvites.reduce(
        (total, i) => total + i.equity,
        0,
      );
      const availableEquity = 100 - membersEquity - pendingEquity;

      if (data.equity > availableEquity) {
        throw new BadRequestException(
          `Only ${availableEquity}% equity available (${membersEquity}% allocated to members, ${pendingEquity}% reserved by pending invitations)`,
        );
      }

      // Create invitation within the same transaction
      return tx.startupInvitation.create({
        data: {
          startupId: targetStartup.id,
          invitedById: profileId,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
          position: data.position,
          equity: data.equity,
          message: data.message,
          ...(data.profileId && { invitedProfileId: data.profileId }),
          ...(!data.profileId &&
            data.email && {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
            }),
        },
      });
    });

    // Send notification to invited user (only if existing user)
    if (data.profileId) {
      try {
        await this.notificationHelper.notifyStartupInvitation({
          invitedProfileId: data.profileId,
          inviterProfileId: profileId,
          inviterName: `${profile.firstName} ${profile.lastName}`.trim(),
          startupId: targetStartup.id,
          startupName: targetStartup.name,
          position: data.position,
        });
      } catch (error) {
        // Don't fail the invitation if notification fails
        this.logger.error('Failed to send startup invitation notification', {
          transactionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.logger.info('Startup invitation created successfully', {
      transactionId,
      userId,
      invitationId: invitation.id,
      targetType: data.profileId ? 'existing_user' : 'new_user',
    });

    return invitation;
  }
}
