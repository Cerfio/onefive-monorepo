import {
  Injectable,
  Inject,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class CreateStartupInvitationHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
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

    // Calculer les parts disponibles
    const currentMembersEquity =
      await this.startupService.getStartupMembersEquity(targetStartup.id);
    const availableEquity = 100 - currentMembersEquity;

    if (data.equity > availableEquity) {
      throw new BadRequestException(
        `Only ${availableEquity}% equity available`,
      );
    }

    // Créer l'invitation
    const invitation = await this.startupService.createInvitation({
      transactionId,
      startupId: targetStartup.id,
      invitedById: userId,
      data: {
        ...data,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      },
    });

    this.logger.info('Startup invitation created successfully', {
      transactionId,
      userId,
      invitationId: invitation.id,
      targetType: data.profileId ? 'existing_user' : 'new_user',
    });

    return invitation;
  }
}
