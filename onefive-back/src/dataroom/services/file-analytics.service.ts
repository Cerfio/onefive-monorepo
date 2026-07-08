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
              Math.max(...trackingEvents.map((e) => e.timestamp.getTime())),
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

      // Per-page analytics — derived from PDF `page_change` events (target page
      // lives in additionalData.newPage). Views = number of times a page was
      // landed on. Time = summed deltas between successive page_change events
      // within a session (the interval before a change is credited to the page
      // being left). The last page of a session has no closing event and gets
      // no time. Deltas are clamped to drop idle-tab outliers. All in-memory on
      // events already fetched — empty until such events are tracked.
      const MAX_PAGE_MS = 30 * 60 * 1000;
      const pageChangeEvents = trackingEvents.filter(
        (e) => e.eventType === 'page_change',
      );

      const pageViewMap = new Map<number, number>();
      for (const e of pageChangeEvents) {
        const page = (e.additionalData as { newPage?: unknown } | null)?.newPage;
        if (typeof page === 'number' && Number.isFinite(page)) {
          pageViewMap.set(page, (pageViewMap.get(page) || 0) + 1);
        }
      }

      // Bucket page_change events per session, chronologically.
      const sessionEvents = new Map<string, typeof pageChangeEvents>();
      for (const e of pageChangeEvents) {
        const arr = sessionEvents.get(e.sessionId) || [];
        arr.push(e);
        sessionEvents.set(e.sessionId, arr);
      }
      const pageTimeMap = new Map<number, number>(); // page -> total ms
      const pageTimeCountMap = new Map<number, number>(); // page -> #intervals
      for (const events of sessionEvents.values()) {
        const sorted = [...events].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
        );
        for (let i = 1; i < sorted.length; i++) {
          const left = (
            sorted[i - 1].additionalData as { newPage?: unknown } | null
          )?.newPage;
          if (typeof left !== 'number' || !Number.isFinite(left)) continue;
          const delta =
            sorted[i].timestamp.getTime() - sorted[i - 1].timestamp.getTime();
          if (delta <= 0) continue;
          pageTimeMap.set(
            left,
            (pageTimeMap.get(left) || 0) + Math.min(delta, MAX_PAGE_MS),
          );
          pageTimeCountMap.set(left, (pageTimeCountMap.get(left) || 0) + 1);
        }
      }

      const pageViews = Array.from(pageViewMap.entries())
        .map(([page, views]) => {
          const count = pageTimeCountMap.get(page) || 0;
          const avgTimeSeconds =
            count > 0
              ? Math.round((pageTimeMap.get(page) || 0) / count / 1000)
              : 0;
          return { page, views, avgTimeSeconds };
        })
        .sort((a, b) => a.page - b.page);

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
        pageViews,
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
