import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import {
  Prisma,
  DataroomFile,
  Dataroom,
  Category,
  DataroomGroup,
  AccessAction,
} from '@prisma/client';
import {
  DataroomCreateException,
  DataroomDeleteException,
  DataroomGetException,
  DataroomListException,
} from '../exceptions/dataroom.exception';
import { TrackingService } from './tracking.service';

@Injectable()
export class DataroomService {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly trackingService: TrackingService,
  ) {}

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: Prisma.DataroomCreateInput;
  }): Promise<Dataroom> {
    try {
      return await this.prisma.dataroom.create({
        data,
      });
    } catch (error) {
      this.logger.error('Failed to create dataroom', { transactionId, error });
      DataroomCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async get({
    transactionId,
    where,
    select,
  }: {
    transactionId: string;
    where: Prisma.DataroomWhereUniqueInput;
    select?: Prisma.DataroomSelect;
  }): Promise<
    Dataroom & {
      startup?: {
        name: string;
        logo: string | null;
      };
      files: (DataroomFile & {
        category: Category;
        _count: {
          accessLogs: number;
        };
      })[];
      categories: (Category & {
        _count: {
          files: number;
        };
      })[];
      groups: (DataroomGroup & {
        _count: {
          members: number;
        };
      })[];
      _count: {
        files: number;
        accessLogs: number;
      };
    }
  > {
    try {
      const result = await this.prisma.dataroom.findUnique({
        where,
        select,
      });

      if (!result) {
        return null;
      }

      return result as unknown as Dataroom & {
        startup?: {
          name: string;
          logo: string | null;
        };
        files: (DataroomFile & {
          category: Category;
          _count: {
            accessLogs: number;
          };
        })[];
        categories: (Category & {
          _count: {
            files: number;
          };
        })[];
        groups: (DataroomGroup & {
          _count: {
            members: number;
          };
        })[];
        _count: {
          files: number;
          accessLogs: number;
        };
      };
    } catch (error) {
      DataroomGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async delete({
    transactionId,
    dataroomId,
  }: {
    transactionId: string;
    dataroomId: string;
  }): Promise<Dataroom> {
    try {
      return await this.prisma.dataroom.delete({
        where: {
          id: dataroomId,
        },
      });
    } catch (error) {
      DataroomDeleteException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async list({
    transactionId,
    profileId,
    skip,
    take,
    orderBy,
  }: {
    transactionId: string;
    profileId: string;
    skip?: number;
    take?: number;
    orderBy?: Prisma.DataroomOrderByWithRelationInput;
  }) {
    try {
      return await this.prisma.dataroom.findMany({
        where: {
          OR: [
            {
              members: {
                some: {
                  profileId,
                },
              },
            },
            {
              directAccess: {
                some: {
                  profileId,
                },
              },
            },
          ],
        },
        skip,
        take,
        orderBy: orderBy ?? { createdAt: 'desc' },
        select: {
          id: true,
          startupId: true,
          createdAt: true,
          updatedAt: true,
          startup: {
            select: {
              name: true,
              logo: true,
            },
          },
          groups: {
            select: {
              name: true,
            },
            where: {
              members: {
                some: {
                  profileId,
                },
              },
            },
          },
          files: {
            select: {
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
          _count: {
            select: {
              files: true,
              accessLogs: {
                where: {
                  action: AccessAction.VIEW,
                },
              },
              members: true,
            },
          },
        },
      });
    } catch (error) {
      DataroomListException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async count({
    transactionId,
    profileId,
  }: {
    transactionId: string;
    profileId: string;
  }): Promise<number> {
    try {
      return await this.prisma.dataroom.count({
        where: {
          OR: [
            {
              members: {
                some: {
                  profileId,
                },
              },
            },
            {
              directAccess: {
                some: {
                  profileId,
                },
              },
            },
          ],
        },
      });
    } catch (error) {
      DataroomListException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  /**
   * Enrichit les données de la dataroom avec les statistiques de tracking
   */
  async enrichWithTrackingStats(
    dataroomId: string,
    profileId: string,
    baseData: Record<string, unknown>,
    period: string = '30d',
  ): Promise<Record<string, unknown>> {
    this.logger.debug('Enriching dataroom with tracking stats', {
      dataroomId,
      profileId,
      period,
    });

    try {
      // Récupérer les analytics de tracking pour les 30 derniers jours
      const analytics = await this.trackingService.getDataroomAnalytics({
        dataroomId,
        profileId,
        period,
      });

      this.logger.debug('Analytics retrieved successfully', { analytics });

      // Enrichir les données existantes avec les statistiques réelles
      const enrichedData = {
        ...baseData,
        // Statistiques de tracking réelles
        totalViews: analytics.totalViews,
        uniqueViewers: analytics.uniqueViewers,
        avgSessionDuration: analytics.avgSessionDuration,
        // Garder le nombre de documents existant (count des fichiers)
        documentCount:
          (baseData as { _count?: { files?: number } })._count?.files || 0,
        // Utiliser les vues du tracking au lieu des anciens accessLogs
        viewCount: analytics.totalViews,
        // Statistiques additionnelles
        trackingStats: {
          totalViews: analytics.totalViews,
          uniqueViewers: analytics.uniqueViewers,
          avgSessionDuration: analytics.avgSessionDuration,
          topFiles: analytics.topFiles,
          userActivity: analytics.userActivity,
        },
      };

      this.logger.debug('Data enriched successfully', {
        totalViews: enrichedData.totalViews,
        uniqueViewers: enrichedData.uniqueViewers,
        avgSessionDuration: enrichedData.avgSessionDuration,
      });

      return enrichedData;
    } catch (error) {
      this.logger.error('Error retrieving tracking statistics', {
        error: error.message,
      });
      this.logger.warn(
        'Erreur lors de la récupération des statistiques de tracking',
        {
          dataroomId,
          error: error.message,
        },
      );

      // En cas d'erreur, retourner les données de base avec valeurs par défaut
      const baseDataTyped = baseData as {
        _count?: { accessLogs?: number; files?: number };
      };
      const fallbackData = {
        ...baseData,
        totalViews: baseDataTyped._count?.accessLogs || 0,
        uniqueViewers: 0,
        avgSessionDuration: 0,
        documentCount: baseDataTyped._count?.files || 0,
        viewCount: baseDataTyped._count?.accessLogs || 0,
      };

      this.logger.warn('Using fallback data for tracking statistics', {
        totalViews: fallbackData.totalViews,
        uniqueViewers: fallbackData.uniqueViewers,
        avgSessionDuration: fallbackData.avgSessionDuration,
      });

      return fallbackData;
    }
  }
}
