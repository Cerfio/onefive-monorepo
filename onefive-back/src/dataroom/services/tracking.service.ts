import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';

const VIEW_EVENT_TYPES = ['file_loaded', 'file_view', 'view'];
const DOWNLOAD_EVENT_TYPES = ['file_download', 'download'];

@Injectable()
export class TrackingService {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async getDataroomAnalytics({
    dataroomId,
    profileId,
    period = '30d',
  }: {
    dataroomId: string;
    profileId: string;
    period?: string;
  }) {
    try {
      const startDate = this.getStartDate(period);
      const now = new Date();

      const trackingEvents = await this.prisma.trackingEvent.findMany({
        where: {
          dataroomId,
          timestamp: { gte: startDate, lte: now },
        },
        include: {
          file: { select: { name: true } },
        },
      });

      // Resolve all unique profile IDs to real profile data
      const uniqueProfileIds = [
        ...new Set(trackingEvents.map((e) => e.profileId)),
      ];
      const profiles = await this.prisma.profile.findMany({
        where: { id: { in: uniqueProfileIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          roles: true,
          avatar: { select: { id: true } },
        },
      });
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      // Count views (file_loaded, file_view, view)
      const totalViews = trackingEvents.filter((e) =>
        VIEW_EVENT_TYPES.includes(e.eventType),
      ).length;

      const uniqueViewers = new Set(
        trackingEvents.map((e) => e.profileId),
      ).size;

      // Average session duration from events that have it
      const sessionDurations = trackingEvents
        .filter((e) => e.sessionDuration !== null && e.sessionDuration > 0)
        .map((e) => e.sessionDuration);
      const avgSessionDuration =
        sessionDurations.length > 0
          ? sessionDurations.reduce((sum, d) => sum + d, 0) /
            sessionDurations.length
          : 0;

      // Top files (count only view events)
      const fileViews = new Map<
        string,
        { fileName: string; views: number; viewerIds: Set<string> }
      >();
      trackingEvents
        .filter((e) => VIEW_EVENT_TYPES.includes(e.eventType))
        .forEach((event) => {
          const current = fileViews.get(event.fileId) || {
            fileName: event.file.name,
            views: 0,
            viewerIds: new Set<string>(),
          };
          current.views += 1;
          current.viewerIds.add(event.profileId);
          fileViews.set(event.fileId, current);
        });

      const topFiles = Array.from(fileViews.entries())
        .map(([fileId, data]) => ({
          fileId,
          fileName: data.fileName,
          views: data.views,
          uniqueViewers: data.viewerIds.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // User activity with real profile data
      const userActivityMap = new Map<
        string,
        {
          lastActivity: Date;
          totalTime: number;
          totalViews: number;
          uniqueFiles: Set<string>;
          documentsViewed: string[];
        }
      >();

      trackingEvents.forEach((event) => {
        const userId = event.profileId;
        const current = userActivityMap.get(userId) || {
          lastActivity: event.timestamp,
          totalTime: 0,
          totalViews: 0,
          uniqueFiles: new Set<string>(),
          documentsViewed: [],
        };

        if (event.timestamp > current.lastActivity) {
          current.lastActivity = event.timestamp;
        }
        if (event.sessionDuration) {
          current.totalTime += event.sessionDuration;
        }
        if (VIEW_EVENT_TYPES.includes(event.eventType)) {
          current.totalViews += 1;
          current.uniqueFiles.add(event.fileId);
          if (!current.documentsViewed.includes(event.file.name)) {
            current.documentsViewed.push(event.file.name);
          }
        }
        userActivityMap.set(userId, current);
      });

      const userActivity = Array.from(userActivityMap.entries()).map(
        ([userId, data]) => {
          const profile = profileMap.get(userId);
          return {
            userId,
            userName: profile
              ? `${profile.firstName} ${profile.lastName}`
              : userId,
            userEmail: '',
            userRole: profile?.roles?.[0] || 'Membre',
            userGroup: '',
            userAvatar: profile?.avatar?.id || null,
            totalViews: data.totalViews,
            totalTime: Math.round(data.totalTime / 1000),
            uniqueDocuments: data.uniqueFiles.size,
            lastActivity: data.lastActivity.toISOString(),
            documentsViewed: data.documentsViewed,
          };
        },
      );

      return {
        totalViews,
        uniqueViewers,
        avgSessionDuration,
        topFiles,
        userActivity,
      };
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des analytics de dataroom',
        {
          dataroomId,
          profileId,
          period,
          error: error.message,
        },
      );
      throw error;
    }
  }

  @Log()
  async saveTrackingEvents({
    profileId,
    events,
    userAgent,
    ipAddress,
  }: {
    profileId: string;
    events: any[];
    userAgent?: string;
    ipAddress?: string;
  }) {
    try {
      const errors: string[] = [];
      const validData: {
        eventType: string;
        dataroomId: string;
        fileId: string;
        profileId: string;
        sessionId: string;
        timestamp: Date;
        sessionDuration?: number;
        additionalData?: object;
        ipAddress?: string;
        userAgent?: string;
      }[] = [];

      for (const event of events) {
        try {
          let additionalData: object | null = null;
          if (event.additionalData) {
            additionalData =
              typeof event.additionalData === 'string'
                ? JSON.parse(event.additionalData)
                : event.additionalData;
          }
          validData.push({
            eventType: event.eventType,
            dataroomId: event.dataroomId,
            fileId: event.fileId,
            profileId,
            sessionId: event.sessionId,
            timestamp: new Date(event.timestamp),
            sessionDuration: event.sessionDuration ?? undefined,
            additionalData: additionalData ?? undefined,
            ipAddress,
            userAgent,
          });
        } catch (parseError) {
          errors.push(
            `Erreur pour l'événement ${event.eventType}: ${(parseError as Error).message}`,
          );
        }
      }

      let processedCount = 0;
      if (validData.length > 0) {
        const result = await this.prisma.trackingEvent.createMany({
          data: validData,
        });
        processedCount = result.count;
      }

      return {
        processedEvents: processedCount,
        message: `${processedCount} événements traités avec succès`,
        errors,
      };
    } catch (error) {
      this.logger.error(
        'Erreur lors de la sauvegarde des événements de tracking',
        {
          profileId,
          error: (error as Error).message,
        },
      );
      throw error;
    }
  }

  private getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}
