import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationCategory, NotificationType, Prisma } from '@prisma/client';
import { NotificationEventsService } from './notification-events.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: NotificationEventsService,
  ) {}

  async findByProfileId(
    profileId: string,
    options?: {
      category?: NotificationCategory;
      read?: boolean;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: Prisma.NotificationWhereInput = {
      profileId,
      ...(options?.category && { category: options.category }),
      ...(options?.read !== undefined && { read: options.read }),
    };

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  }

  async countByProfileId(profileId: string, read?: boolean) {
    return this.prisma.notification.count({
      where: {
        profileId,
        ...(read !== undefined && { read }),
      },
    });
  }

  async countByCategory(profileId: string) {
    const [engagement, invitations, system] = await Promise.all([
      this.prisma.notification.count({
        where: { profileId, category: 'ENGAGEMENT', read: false },
      }),
      this.prisma.notification.count({
        where: { profileId, category: 'INVITATIONS', read: false },
      }),
      this.prisma.notification.count({
        where: { profileId, category: 'SYSTEM', read: false },
      }),
    ]);

    return { engagement, invitations, system };
  }

  async create(data: {
    profileId: string;
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
    actorId?: string;
    entityId?: string;
    entityType?: string;
    data?: Prisma.JsonValue;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        profileId: data.profileId,
        type: data.type,
        category: data.category,
        title: data.title,
        message: data.message,
        actorId: data.actorId,
        entityId: data.entityId,
        entityType: data.entityType,
        data: data.data,
      },
    });
    // Push temps réel (SSE) — le client rafraîchit instantanément.
    this.events.emit(data.profileId, 'notification:new', notification);
    return notification;
  }

  async markAsRead(id: string, profileId: string) {
    return this.prisma.notification.updateMany({
      where: { id, profileId },
      data: { read: true },
    });
  }

  async markAllAsRead(profileId: string, category?: NotificationCategory) {
    return this.prisma.notification.updateMany({
      where: {
        profileId,
        read: false,
        ...(category && { category }),
      },
      data: { read: true },
    });
  }

  async delete(id: string, profileId: string) {
    return this.prisma.notification.deleteMany({
      where: { id, profileId },
    });
  }

  async deleteOldNotifications(profileId: string, daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.prisma.notification.deleteMany({
      where: {
        profileId,
        createdAt: { lt: cutoffDate },
        read: true,
      },
    });
  }
}
