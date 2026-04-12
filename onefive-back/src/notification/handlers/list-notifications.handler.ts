import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationCategory } from '@prisma/client';
import { StorageService } from '../../storage/storage.service';
import { FileUrlUtils } from '../../common/utils';
import { PaginatedResponseDto } from '../../common/dto';

@Injectable()
export class ListNotificationsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async execute({
    transactionId,
    userId,
    category,
    read,
    limit,
    offset,
  }: {
    transactionId: string;
    userId: string;
    category?: NotificationCategory;
    read?: boolean;
    limit?: number;
    offset?: number;
  }) {
    // Récupérer le profil de l'utilisateur
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return { notifications: [], total: 0, hasMore: false };
    }

    // Récupérer les notifications
    const notifications = await this.notificationService.findByProfileId(
      profile.id,
      { category, read, limit, offset },
    );

    // Récupérer le total pour la pagination
    const total = await this.notificationService.countByProfileId(
      profile.id,
      read,
    );

    // Récupérer les actorIds uniques pour charger les avatars
    const actorIds = [
      ...new Set(notifications.map((n) => n.actorId).filter(Boolean)),
    ] as string[];

    // Récupérer les profils des acteurs avec leurs avatars
    const actorProfiles =
      actorIds.length > 0
        ? await this.prisma.profile.findMany({
            where: { id: { in: actorIds } },
            select: {
              id: true,
              avatar: { select: { id: true } },
            },
          })
        : [];

    // Créer un map des avatars par actorId
    const actorAvatarMap = new Map<string, string | null>();
    for (const actor of actorProfiles) {
      const avatarUrl = actor.avatar?.id
        ? await this.fileUrlUtils.getFileUrl(
            actor.avatar.id,
            this.storageService,
          )
        : null;
      actorAvatarMap.set(actor.id, avatarUrl);
    }

    // Formater les notifications pour le frontend
    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      category: notif.category.toLowerCase(),
      title: notif.title,
      message: notif.message,
      read: notif.read,
      actorId: notif.actorId,
      actorAvatar: notif.actorId
        ? actorAvatarMap.get(notif.actorId) || null
        : null,
      entityId: notif.entityId,
      entityType: notif.entityType,
      data: notif.data,
      createdAt: notif.createdAt,
    }));

    return PaginatedResponseDto.fromOffset({
      items: formattedNotifications,
      skip: offset || 0,
      limit: limit || 20,
      total,
    });
  }
}
