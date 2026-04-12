import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { NetworkService } from '../network.service';
import { Log } from '../../common/logger/logger.decorator';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConnectProfileHandler {
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
    this.logger.info('Creating connection request', {
      transactionId,
      userId,
      profileId,
    });

    const connection = await this.networkService.connectProfile({
      transactionId,
      userId,
      profileId,
    });

    // Si la connexion a été acceptée automatiquement (connexion simultanée)
    if ((connection as any).autoAccepted) {
      // Récupérer les informations des deux profils pour créer des notifications mutuelles
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true, firstName: true, lastName: true },
      });

      const accepterProfile = await this.prisma.profile.findUnique({
        where: { id: profileId },
        select: { id: true, firstName: true, lastName: true },
      });

      if (requesterProfile && accepterProfile) {
        const requesterName = `${requesterProfile.firstName} ${requesterProfile.lastName}`;
        const accepterName = `${accepterProfile.firstName} ${accepterProfile.lastName}`;

        // Notifier les deux personnes que la connexion a été acceptée automatiquement
        await Promise.all([
          this.notificationHelper
            .notifyConnectionAccepted({
              accepterProfileId: accepterProfile.id,
              requesterProfileId: requesterProfile.id,
              accepterName,
            })
            .catch((error) => {
              this.logger.error(
                'Failed to create auto-accept notification for requester',
                {
                  transactionId,
                  error: error.message,
                },
              );
            }),
          this.notificationHelper
            .notifyConnectionAccepted({
              accepterProfileId: requesterProfile.id,
              requesterProfileId: accepterProfile.id,
              accepterName: requesterName,
            })
            .catch((error) => {
              this.logger.error(
                'Failed to create auto-accept notification for accepter',
                {
                  transactionId,
                  error: error.message,
                },
              );
            }),
        ]);
      }
    } else {
      // Si la connexion n'a pas été acceptée automatiquement, créer une notification de demande
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true, firstName: true, lastName: true },
      });

      if (requesterProfile) {
        const requesterName = `${requesterProfile.firstName} ${requesterProfile.lastName}`;

        // Créer la notification pour l'accepter
        try {
          const notification =
            await this.notificationHelper.notifyConnectionRequest({
              requesterProfileId: requesterProfile.id,
              accepterProfileId: profileId,
              requesterName,
            });

          this.logger.info('Connection request notification created', {
            transactionId,
            notificationId: notification?.id,
            requesterProfileId: requesterProfile.id,
            accepterProfileId: profileId,
          });
        } catch (error) {
          // Logger l'erreur mais ne pas faire échouer la connexion
          this.logger.error(
            'Failed to create connection request notification',
            {
              transactionId,
              error: error instanceof Error ? error.message : String(error),
              requesterProfileId: requesterProfile.id,
              accepterProfileId: profileId,
            },
          );
        }
      }
    }

    this.logger.info('Connection request created successfully', {
      transactionId,
      userId,
      profileId,
      connectionId: connection.id,
      autoAccepted: (connection as any).autoAccepted || false,
    });

    return connection;
  }
}
