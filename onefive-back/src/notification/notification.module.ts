import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationHelperService } from './notification-helper.service';
import { NotificationEventsService } from './notification-events.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { StorageModule } from '../storage/storage.module';

// Handlers
import { ListNotificationsHandler } from './handlers/list-notifications.handler';
import { GetNotificationCountsHandler } from './handlers/get-notification-counts.handler';
import { MarkNotificationReadHandler } from './handlers/mark-notification-read.handler';
import { MarkAllNotificationsReadHandler } from './handlers/mark-all-notifications-read.handler';
import { CreateNotificationHandler } from './handlers/create-notification.handler';
import { DeleteNotificationHandler } from './handlers/delete-notification.handler';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationHelperService,
    NotificationEventsService,
    LoggerProvider,

    // Handlers
    ListNotificationsHandler,
    GetNotificationCountsHandler,
    MarkNotificationReadHandler,
    MarkAllNotificationsReadHandler,
    CreateNotificationHandler,
    DeleteNotificationHandler,
  ],
  exports: [
    NotificationService,
    NotificationHelperService,
    CreateNotificationHandler,
  ],
})
export class NotificationModule {}
