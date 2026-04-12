import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { NetworkService } from '../network.service';
import { Log } from '../../common/logger/logger.decorator';
import { Prisma } from '@prisma/client';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AcceptConnectionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly networkService: NetworkService,
    private readonly notificationHelper: NotificationHelperService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    this.logger.info('Accepting connection request', {
      transactionId,
      userId,
      profileId,
    });

    const result = await this.networkService.acceptConnection({
      transactionId,
      userId,
      profileId,
    });

    // Créer une notification pour le requester (personne A) que sa demande a été acceptée
    try {
      // Récupérer les informations de l'accepter (personne B qui a accepté)
      const accepterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true, firstName: true, lastName: true },
      });

      if (accepterProfile) {
        const accepterName = `${accepterProfile.firstName} ${accepterProfile.lastName}`;

        // Notifier le requester (personne A) que sa demande a été acceptée
        await this.notificationHelper
          .notifyConnectionAccepted({
            accepterProfileId: accepterProfile.id,
            requesterProfileId: profileId,
            accepterName,
          })
          .catch((error) => {
            // Logger l'erreur mais ne pas faire échouer l'acceptation
            this.logger.error(
              'Failed to create connection accepted notification',
              {
                transactionId,
                error: error.message,
              },
            );
          });
      }
    } catch (error) {
      // Logger l'erreur mais ne pas faire échouer l'acceptation
      this.logger.error('Failed to create connection accepted notification', {
        transactionId,
        error: error.message,
      });
    }

    this.logger.info('Connection request accepted', {
      transactionId,
      userId,
      profileId,
    });

    return result;
  }
}
