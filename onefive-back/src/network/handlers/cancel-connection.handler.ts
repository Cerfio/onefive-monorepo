import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';
import { RelationshipStatus } from '@prisma/client';

@Injectable()
export class CancelConnectionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
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
    this.logger.info('Cancelling connection request', {
      transactionId,
      userId,
      profileId,
    });

    // Get the requester's profile
    const requesterProfile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!requesterProfile) {
      throw new NotFoundException('Requester profile not found');
    }

    // Find the pending connection where the current user is the requester
    const connection = await this.prisma.relationship.findFirst({
      where: {
        requesterId: requesterProfile.id,
        accepterId: profileId,
        status: RelationshipStatus.PENDING,
      },
    });

    if (!connection) {
      throw new NotFoundException('No pending connection request found');
    }

    // Delete the connection
    await this.prisma.relationship.delete({
      where: {
        requesterId_accepterId: {
          requesterId: requesterProfile.id,
          accepterId: profileId,
        },
      },
    });

    // Delete associated notification if it exists
    try {
      await this.prisma.notification.deleteMany({
        where: {
          type: 'CONNECTION_REQUEST',
          actorId: requesterProfile.id,
          profileId: profileId,
        },
      });

      this.logger.info('Deleted connection request notification', {
        transactionId,
        requesterProfileId: requesterProfile.id,
        accepterProfileId: profileId,
      });
    } catch (error) {
      this.logger.error('Failed to delete notification', {
        transactionId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    this.logger.info('Connection request cancelled successfully', {
      transactionId,
      userId,
      profileId,
    });

    return { success: true, message: 'Connection request cancelled' };
  }
}
