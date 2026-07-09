import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Req,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from '../types/fastify-request-user-id';
import { ListNotificationsHandler } from './handlers/list-notifications.handler';
import { GetNotificationCountsHandler } from './handlers/get-notification-counts.handler';
import { MarkNotificationReadHandler } from './handlers/mark-notification-read.handler';
import { MarkAllNotificationsReadHandler } from './handlers/mark-all-notifications-read.handler';
import { DeleteNotificationHandler } from './handlers/delete-notification.handler';
import { NotificationEventsService } from './notification-events.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationCategory } from '@prisma/client';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly listNotificationsHandler: ListNotificationsHandler,
    private readonly getNotificationCountsHandler: GetNotificationCountsHandler,
    private readonly markNotificationReadHandler: MarkNotificationReadHandler,
    private readonly markAllNotificationsReadHandler: MarkAllNotificationsReadHandler,
    private readonly deleteNotificationHandler: DeleteNotificationHandler,
    private readonly events: NotificationEventsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /notifications/events — stream SSE temps réel des notifications.
   * Le cookie de session authentifie (EventSource withCredentials).
   */
  @Sse('events')
  streamEvents(
    @Req() req: FastifyRequest & FastifyRequestUserId,
  ): Observable<MessageEvent> {
    return from(
      this.prisma.profile.findUnique({
        where: { userId: req.userId },
        select: { id: true },
      }),
    ).pipe(
      switchMap((profile) => this.events.subscribe(profile?.id ?? req.userId)),
    );
  }

  /**
   * GET /notifications
   * Liste les notifications de l'utilisateur connecté
   */
  @Get()
  async listNotifications(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query('category') category?: NotificationCategory,
    @Query('read') read?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const data = await this.listNotificationsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      category,
      read: read !== undefined ? read === 'true' : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    return { success: true, data };
  }

  /**
   * GET /notifications/counts
   * Récupère le nombre de notifications non lues par catégorie
   */
  @Get('counts')
  async getNotificationCounts(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ) {
    const data = await this.getNotificationCountsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data };
  }

  /**
   * PATCH /notifications/:id/read
   * Marque une notification comme lue
   */
  @Patch(':id/read')
  async markAsRead(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('id') notificationId: string,
  ) {
    const data = await this.markNotificationReadHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      notificationId,
    });
    return { success: true, data };
  }

  /**
   * PATCH /notifications/read-all
   * Marque toutes les notifications comme lues
   */
  @Patch('read-all')
  async markAllAsRead(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Query('category') category?: NotificationCategory,
  ) {
    const data = await this.markAllNotificationsReadHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      category,
    });
    return { success: true, data };
  }

  /**
   * DELETE /notifications/:id
   * Supprime une notification
   */
  @Delete(':id')
  async deleteNotification(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('id') notificationId: string,
  ) {
    const data = await this.deleteNotificationHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      notificationId,
    });
    return { success: true, data };
  }
}
