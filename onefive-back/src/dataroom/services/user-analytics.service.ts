import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

const VIEW_EVENT_TYPES = ['file_loaded', 'file_view', 'view'];

@Injectable()
export class UserAnalyticsService {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
  ) {}

  async getUserAnalytics({
    userId,
    dataroomId,
    period = '7d',
  }: {
    userId: string;
    dataroomId: string;
    period?: string;
  }) {
    try {
      const startDate = this.getStartDate(period);
      const now = new Date();

      const [trackingEvents, profile] = await Promise.all([
        this.prisma.trackingEvent.findMany({
          where: {
            profileId: userId,
            dataroomId,
            timestamp: { gte: startDate, lte: now },
          },
          include: {
            file: { select: { id: true, name: true } },
          },
        }),
        this.prisma.profile.findUnique({
          where: { id: userId },
          select: {
            firstName: true,
            lastName: true,
            roles: true,
            avatar: { select: { id: true } },
          },
        }),
      ]);

      const userName = profile
        ? `${profile.firstName} ${profile.lastName}`
        : userId;

      const totalViews = trackingEvents.filter((e) =>
        VIEW_EVENT_TYPES.includes(e.eventType),
      ).length;

      const totalTimeSpent = trackingEvents.reduce(
        (sum, e) => sum + (e.sessionDuration || 0),
        0,
      );

      const filesViewedSet = new Set(
        trackingEvents
          .filter((e) => VIEW_EVENT_TYPES.includes(e.eventType))
          .map((e) => e.fileId),
      );

      const lastActivity =
        trackingEvents.length > 0
          ? new Date(
              Math.max(
                ...trackingEvents.map((e) => e.timestamp.getTime()),
              ),
            ).toISOString()
          : new Date().toISOString();

      const sessionDurations = trackingEvents
        .filter((e) => e.sessionDuration !== null && e.sessionDuration > 0)
        .map((e) => e.sessionDuration);
      const avgSessionDuration =
        sessionDurations.length > 0
          ? sessionDurations.reduce((sum, d) => sum + d, 0) /
            sessionDurations.length
          : 0;

      // Build per-file activity
      const fileMap = new Map<
        string,
        { fileName: string; views: number; timeSpent: number; category?: string }
      >();
      trackingEvents.forEach((e) => {
        const current = fileMap.get(e.fileId) || {
          fileName: e.file.name,
          views: 0,
          timeSpent: 0,
        };
        if (VIEW_EVENT_TYPES.includes(e.eventType)) {
          current.views += 1;
        }
        if (e.sessionDuration) {
          current.timeSpent += e.sessionDuration;
        }
        fileMap.set(e.fileId, current);
      });

      const fileActivity = Array.from(fileMap.entries()).map(
        ([fileId, data]) => ({
          fileId,
          fileName: data.fileName,
          views: data.views,
          timeSpent: Math.round(data.timeSpent / 1000),
          timeSpentFormatted: this.formatDuration(data.timeSpent),
        }),
      );

      return {
        userId,
        userName,
        userEmail: '',
        userRole: profile?.roles?.[0] || 'Membre',
        userGroup: '',
        userAvatar: profile?.avatar?.id || null,
        totalViews,
        totalTimeSpent: Math.round(totalTimeSpent / 1000),
        totalTimeFormatted: this.formatDuration(totalTimeSpent),
        filesViewed: filesViewedSet.size,
        lastActivity,
        avgSessionDuration: Math.round(avgSessionDuration),
        fileActivity,
      };
    } catch (error) {
      this.logger.error(
        "Erreur lors de la récupération des analytics d'utilisateur",
        { userId, dataroomId, period, error: error.message },
      );
      throw error;
    }
  }

  private formatDuration(ms: number): string {
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }
}
