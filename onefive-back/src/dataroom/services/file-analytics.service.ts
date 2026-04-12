import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

const VIEW_EVENT_TYPES = ['file_loaded', 'file_view', 'view'];
const DOWNLOAD_EVENT_TYPES = ['file_download', 'download'];

@Injectable()
export class FileAnalyticsService {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
  ) {}

  async getFileAnalytics({
    fileId,
    period = '7d',
  }: {
    fileId: string;
    period?: string;
  }) {
    try {
      const startDate = this.getStartDate(period);
      const now = new Date();

      const file = await this.prisma.dataroomFile.findUnique({
        where: { id: fileId },
        include: { category: { select: { name: true } } },
      });

      if (!file) {
        throw new NotFoundException('File not found');
      }

      const trackingEvents = await this.prisma.trackingEvent.findMany({
        where: {
          fileId,
          timestamp: { gte: startDate, lte: now },
        },
      });

      const totalViews = trackingEvents.filter((e) =>
        VIEW_EVENT_TYPES.includes(e.eventType),
      ).length;

      const uniqueViewerIds = [
        ...new Set(trackingEvents.map((e) => e.profileId)),
      ];

      const downloadCount = trackingEvents.filter((e) =>
        DOWNLOAD_EVENT_TYPES.includes(e.eventType),
      ).length;

      const timeSpentEvents = trackingEvents.filter(
        (e) => e.sessionDuration !== null && e.sessionDuration > 0,
      );
      const avgTimeSpent =
        timeSpentEvents.length > 0
          ? timeSpentEvents.reduce(
              (sum, e) => sum + (e.sessionDuration || 0),
              0,
            ) / timeSpentEvents.length
          : 0;

      const lastViewed =
        trackingEvents.length > 0
          ? new Date(
              Math.max(
                ...trackingEvents.map((e) => e.timestamp.getTime()),
              ),
            ).toISOString()
          : file.createdAt.toISOString();

      // Resolve viewer profiles
      const profiles = await this.prisma.profile.findMany({
        where: { id: { in: uniqueViewerIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          roles: true,
          avatar: { select: { id: true } },
        },
      });
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      // Build per-user activity for this file
      const userMap = new Map<
        string,
        { totalTime: number; lastActivity: Date }
      >();
      trackingEvents.forEach((e) => {
        const current = userMap.get(e.profileId) || {
          totalTime: 0,
          lastActivity: e.timestamp,
        };
        if (e.sessionDuration) current.totalTime += e.sessionDuration;
        if (e.timestamp > current.lastActivity)
          current.lastActivity = e.timestamp;
        userMap.set(e.profileId, current);
      });

      const userActivity = Array.from(userMap.entries()).map(
        ([userId, data]) => {
          const profile = profileMap.get(userId);
          return {
            userId,
            userName: profile
              ? `${profile.firstName} ${profile.lastName}`
              : userId,
            userEmail: '',
            userRole: profile?.roles?.[0] || 'Membre',
            userAvatar: profile?.avatar?.id || null,
            lastActivity: data.lastActivity.toISOString(),
            totalTime: Math.round(data.totalTime / 1000),
            timeSpentFormatted: this.formatDuration(data.totalTime),
          };
        },
      );

      return {
        fileId: file.id,
        fileName: file.name,
        totalViews,
        uniqueViewers: uniqueViewerIds.length,
        avgTimeSpent: Math.round(avgTimeSpent),
        downloadCount,
        category: file.category.name,
        uploadedAt: file.createdAt.toISOString(),
        lastViewed,
        userActivity,
      };
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération des analytics de fichier',
        { fileId, period, error: error.message },
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
