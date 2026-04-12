import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';

@Injectable()
export class TimelineService {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
  ) {}

  async getUserTimeline({
    userId,
    dataroomId,
  }: {
    userId: string;
    dataroomId: string;
  }) {
    try {
      const trackingEvents = await this.prisma.trackingEvent.findMany({
        where: {
          profileId: userId,
          dataroomId,
        },
        include: {
          file: { select: { name: true } },
        },
        orderBy: { timestamp: 'desc' },
        take: 50,
      });

      const profile = await this.prisma.profile.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      const userName = profile
        ? `${profile.firstName} ${profile.lastName}`
        : userId;

      const timeline = trackingEvents.map((event) => ({
        timestamp: event.timestamp.toISOString(),
        eventType: event.eventType,
        fileId: event.fileId,
        fileName: event.file.name,
        action: this.getActionFromEventType(event.eventType),
        duration: event.sessionDuration,
      }));

      return { userId, userName, timeline };
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération de la timeline utilisateur',
        { userId, dataroomId, error: error.message },
      );
      throw error;
    }
  }

  async getDataroomTimeline({ dataroomId }: { dataroomId: string }) {
    try {
      const trackingEvents = await this.prisma.trackingEvent.findMany({
        where: { dataroomId },
        include: {
          file: { select: { name: true } },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      // Resolve profiles
      const uniqueProfileIds = [
        ...new Set(trackingEvents.map((e) => e.profileId)),
      ];
      const profiles = await this.prisma.profile.findMany({
        where: { id: { in: uniqueProfileIds } },
        select: { id: true, firstName: true, lastName: true },
      });
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      const timeline = trackingEvents.map((event) => {
        const profile = profileMap.get(event.profileId);
        return {
          timestamp: event.timestamp.toISOString(),
          eventType: event.eventType,
          userId: event.profileId,
          userName: profile
            ? `${profile.firstName} ${profile.lastName}`
            : event.profileId,
          fileId: event.fileId,
          fileName: event.file.name,
          action: this.getActionFromEventType(event.eventType),
          duration: event.sessionDuration,
        };
      });

      return { dataroomId, timeline };
    } catch (error) {
      this.logger.error(
        'Erreur lors de la récupération de la timeline dataroom',
        { dataroomId, error: error.message },
      );
      throw error;
    }
  }

  private getActionFromEventType(eventType: string): string {
    switch (eventType) {
      case 'file_loaded':
      case 'file_view':
      case 'view':
        return 'Consulté';
      case 'file_download':
      case 'download':
        return 'Téléchargé';
      case 'file_click':
        return 'Cliqué';
      case 'session_start':
        return 'Session démarrée';
      case 'session_end':
        return 'Session terminée';
      case 'page_change':
        return 'Page changée';
      case 'heartbeat':
        return 'Actif';
      case 'page_visible':
        return 'Page visible';
      case 'page_hidden':
        return 'Page masquée';
      default:
        return eventType;
    }
  }
}
