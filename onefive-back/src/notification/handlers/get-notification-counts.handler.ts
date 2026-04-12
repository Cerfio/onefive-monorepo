import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetNotificationCountsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    // Récupérer le profil de l'utilisateur
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return {
        counts: { engagement: 0, invitations: 0, system: 0 },
        total: 0,
        hasUnread: false,
      };
    }

    // Récupérer les compteurs par catégorie
    const counts = await this.notificationService.countByCategory(profile.id);

    const total = counts.engagement + counts.invitations + counts.system;

    return {
      counts,
      total,
      hasUnread: total > 0,
    };
  }
}
