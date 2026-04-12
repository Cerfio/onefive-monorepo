import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Inject } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import {
  AchievementCreateException,
  AchievementUpdateException,
  AchievementDeleteException,
} from './profile.exception';

@Injectable()
export class AchievementService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    transactionId,
    profileId,
    data,
  }: {
    transactionId: string;
    profileId: string;
    data: { title: string; description: string; date?: string };
  }) {
    try {
      return await this.prisma.achievement.create({
        data: {
          profileId,
          ...data,
        },
      });
    } catch (error) {
      AchievementCreateException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async update({
    transactionId,
    where,
    data,
  }: {
    transactionId: string;
    where: { id: string; profileId?: string };
    data: { title?: string; description?: string; date?: string };
  }) {
    try {
      return await this.prisma.achievement.update({
        where: { id: where.id },
        data,
      });
    } catch (error) {
      AchievementUpdateException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async delete({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: { id: string; profileId?: string };
  }) {
    try {
      return await this.prisma.achievement.delete({
        where: { id: where.id },
      });
    } catch (error) {
      AchievementDeleteException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async batchUpdate({
    transactionId,
    profileId,
    achievements,
    deleteIds,
  }: {
    transactionId: string;
    profileId: string;
    achievements: Array<{
      id?: string;
      title: string;
      description: string;
      date?: string;
    }>;
    deleteIds: string[];
  }) {
    try {
      const results = { created: 0, updated: 0, deleted: 0 };

      // Supprimer les achievements
      if (deleteIds.length > 0) {
        await this.prisma.achievement.deleteMany({
          where: {
            id: { in: deleteIds },
            profileId, // Sécurité : vérifier propriété
          },
        });
        results.deleted = deleteIds.length;
      }

      // Créer ou mettre à jour les achievements
      for (const achievement of achievements) {
        if (achievement.id && !achievement.id.startsWith('new_')) {
          // Mise à jour
          await this.prisma.achievement.update({
            where: {
              id: achievement.id,
              profileId, // Sécurité : vérifier propriété
            },
            data: {
              title: achievement.title,
              description: achievement.description,
              date: achievement.date,
            },
          });
          results.updated++;
        } else {
          // Création
          await this.prisma.achievement.create({
            data: {
              profileId,
              title: achievement.title,
              description: achievement.description,
              date: achievement.date,
            },
          });
          results.created++;
        }
      }

      return results;
    } catch (error) {
      AchievementUpdateException.throw(this.logger, { transactionId, error });
    }
  }

  @Log()
  async findMany({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: { profileId: string };
  }) {
    try {
      return await this.prisma.achievement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      AchievementUpdateException.throw(this.logger, { transactionId, error });
    }
  }
}
