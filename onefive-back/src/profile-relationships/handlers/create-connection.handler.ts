import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { ProfileRelationshipsService } from '../profile-relationships.service';
import { Log } from '../../common/logger/logger.decorator';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CreateConnectionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileRelationshipsService: ProfileRelationshipsService,
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

    // Get actor profile info
    const actorProfile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true, firstName: true, lastName: true },
    });

    const connection = await this.profileRelationshipsService.connectProfile({
      transactionId,
      userId,
      profileId,
    });

    // Send notification to the recipient
    if (actorProfile && actorProfile.id !== profileId) {
      try {
        await this.notificationHelper.notifyConnectionRequest({
          requesterProfileId: actorProfile.id,
          accepterProfileId: profileId,
          requesterName:
            `${actorProfile.firstName} ${actorProfile.lastName}`.trim(),
        });
      } catch (error) {
        // Don't fail the connection if notification fails
        this.logger.error('Failed to send connection request notification', {
          transactionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.logger.info('Connection request created successfully', {
      transactionId,
      userId,
      profileId,
      connectionId: connection.id,
    });

    return connection;
  }
}
