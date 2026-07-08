import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { TrackingService } from '../services/tracking.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import {
  SaveTrackingEventsDto,
  SaveTrackingEventsResponseDto,
} from '../dto/tracking-events.dto';

// Types d'events considérés comme une "ouverture / consultation" du dataroom.
const VIEW_EVENT_TYPES = ['file_loaded', 'file_view', 'view'];

@Injectable()
export class TrackingEventsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly trackingService: TrackingService,
    private readonly prisma: PrismaService,
    private readonly notificationHelper: NotificationHelperService,
  ) {}

  async saveEvents(
    input: SaveTrackingEventsDto,
    profileId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<SaveTrackingEventsResponseDto> {
    try {
      const result = await this.trackingService.saveTrackingEvents({
        profileId,
        events: input.events.map((event) => ({
          eventType: event.eventType,
          dataroomId: event.dataroomId,
          fileId: event.fileId,
          sessionId: event.sessionId,
          timestamp: event.timestamp,
          sessionDuration: event.sessionDuration,
          additionalData: event.additionalData
            ? JSON.stringify(event.additionalData)
            : undefined,
        })),
        userAgent,
        ipAddress,
      });

      // Notifier le propriétaire du dataroom (fire-and-forget : ne doit jamais
      // bloquer ni faire échouer l'ingestion des events de tracking).
      void this.notifyOwnersOfViews(profileId, input.events).catch((err) =>
        this.logger.error('Failed to notify dataroom owner of view', {
          transactionId: input.transactionId,
          error: err?.message,
        }),
      );

      return {
        data: {
          processedEvents: result.processedEvents,
          message: 'Events processed successfully',
        },
      };
    } catch (error) {
      this.logger.error('Failed to save tracking events', {
        transactionId: input.transactionId,
        error: error.message,
        eventsCount: input.events.length,
      });

      return {
        data: {
          processedEvents: 0,
          message: 'Error during processing',
          errors: [error.message],
        },
      };
    }
  }

  /**
   * Envoie une notification "X a ouvert votre dataroom" au propriétaire, une
   * seule fois par (propriétaire, dataroom, visiteur) — la 1re consultation.
   * Le visiteur qui consulte son propre dataroom n'est jamais notifié.
   */
  private async notifyOwnersOfViews(
    viewerProfileId: string,
    events: SaveTrackingEventsDto['events'],
  ): Promise<void> {
    const viewedDataroomIds = [
      ...new Set(
        events
          .filter((e) => VIEW_EVENT_TYPES.includes(e.eventType))
          .map((e) => e.dataroomId)
          .filter((id): id is string => !!id),
      ),
    ];
    if (viewedDataroomIds.length === 0) return;

    const viewer = await this.prisma.profile.findUnique({
      where: { id: viewerProfileId },
      select: { firstName: true, lastName: true },
    });
    const viewerName = viewer
      ? `${viewer.firstName} ${viewer.lastName}`.trim()
      : 'Quelqu’un';

    for (const dataroomId of viewedDataroomIds) {
      const dataroom = await this.prisma.dataroom.findUnique({
        where: { id: dataroomId },
        select: { createdBy: true, startup: { select: { name: true } } },
      });
      if (!dataroom) continue;

      const ownerProfileId = dataroom.createdBy;
      if (ownerProfileId === viewerProfileId) continue;

      // Dédup "première vue" : une notif au plus par (owner, deck, visiteur).
      const already = await this.prisma.notification.findFirst({
        where: {
          profileId: ownerProfileId,
          type: 'DATAROOM_ENGAGEMENT',
          entityId: dataroomId,
          actorId: viewerProfileId,
        },
        select: { id: true },
      });
      if (already) continue;

      await this.notificationHelper.notifyDataroomEngagement({
        ownerProfileId,
        dataroomId,
        dataroomName: dataroom.startup?.name || 'votre dataroom',
        engagementType: 'first_view',
        actorName: viewerName,
        actorProfileId: viewerProfileId,
      });
    }
  }
}
