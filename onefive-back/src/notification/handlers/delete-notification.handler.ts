import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeleteNotificationHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    notificationId,
  }: {
    transactionId: string;
    userId: string;
    notificationId: string;
  }) {
    // Récupérer le profil de l'utilisateur
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      return { deleted: false };
    }

    // Supprimer la notification
    await this.notificationService.delete(notificationId, profile.id);

    return { deleted: true };
  }
}
