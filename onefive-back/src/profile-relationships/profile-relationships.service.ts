import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../common/logger/logger.decorator';
import {
  ProfileRelationshipsCreateException,
  ProfileRelationshipsGetException,
} from './profile-relationships.exception';

@Injectable()
export class ProfileRelationshipsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async connectProfile({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    try {
      // Récupérer le profileId du user connecté
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }

      const requesterProfileId = userProfile.id;

      // Vérifier si la connexion existe déjà
      const existingConnection = await this.prisma.relationship.findFirst({
        where: {
          OR: [
            { requesterId: requesterProfileId, accepterId: profileId },
            { requesterId: profileId, accepterId: requesterProfileId },
          ],
        },
      });

      if (existingConnection) {
        throw new ConflictException('Connection already exists');
      }

      // Créer la demande de connexion
      const connection = await this.prisma.relationship.create({
        data: {
          requesterId: requesterProfileId,
          accepterId: profileId,
        },
      });

      return {
        id: `${connection.requesterId}-${connection.accepterId}`, // Composite key
        requesterId: connection.requesterId,
        accepterId: connection.accepterId,
        createdAt: connection.createdAt,
      };
    } catch (error) {
      ProfileRelationshipsCreateException.throw(this.logger, {
        transactionId,
        userId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async getUserRelationships({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    try {
      // Récupérer le profileId du user connecté
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        throw new NotFoundException('User profile not found');
      }

      const requesterProfileId = userProfile.id;

      // Récupérer les connexions (relationships)
      const relationships = await this.prisma.relationship.findMany({
        where: {
          OR: [
            { requesterId: requesterProfileId },
            { accepterId: requesterProfileId },
          ],
        },
        select: {
          requesterId: true,
          accepterId: true,
        },
      });

      // Séparer les connexions en cours (pending) et acceptées (connected)
      const pending: string[] = [];
      const connected: string[] = [];

      relationships.forEach((rel) => {
        const otherUserId =
          rel.requesterId === requesterProfileId
            ? rel.accepterId
            : rel.requesterId;
        // Pour l'instant, on considère toutes les connexions comme acceptées
        // Future: champ status dans Relationship si nécessaire
        connected.push(otherUserId);
      });

      return { connected, pending };
    } catch (error) {
      ProfileRelationshipsGetException.throw(this.logger, {
        transactionId,
        userId,
        error,
      });
    }
  }
}
