import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationCategory } from '@prisma/client';

@Injectable()
export class MarkAllNotificationsReadHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    category,
  }: {
    transactionId: string;
    userId: string;
    category?: NotificationCategory;
  }) {
    // Récupérer le profil de l'utilisateur
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return { markedCount: 0 };
    }

    // Marquer toutes les notifications comme lues
    const result = await this.notificationService.markAllAsRead(
      profile.id,
      category,
    );

    return { markedCount: result.count };
  }
}
