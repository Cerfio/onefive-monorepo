import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { NotificationService } from '../notification.service';
import { NotificationCategory, NotificationType, Prisma } from '@prisma/client';

export interface CreateNotificationInput {
  transactionId: string;
  profileId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actorId?: string;
  entityId?: string;
  entityType?: string;
  data?: Prisma.JsonValue;
}

@Injectable()
export class CreateNotificationHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly notificationService: NotificationService,
  ) {}

  @Log()
  async execute(input: CreateNotificationInput) {
    const notification = await this.notificationService.create({
      profileId: input.profileId,
      type: input.type,
      category: input.category,
      title: input.title,
      message: input.message,
      actorId: input.actorId,
      entityId: input.entityId,
      entityType: input.entityType,
      data: input.data,
    });

    return notification;
  }
}
