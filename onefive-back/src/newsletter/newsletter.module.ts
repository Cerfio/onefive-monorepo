import { Module } from '@nestjs/common';
import { AdminModule } from 'src/admin/admin.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminPermissionGuard } from 'src/admin/guards/admin-permission.guard';
import { AdminSessionGuard } from 'src/admin/guards/admin-session.guard';
import { CreateNewsletterFeedHandler } from './handlers/create-newsletter-feed.handler';
import { ListNewsletterFeedsHandler } from './handlers/list-newsletter-feeds.handler';
import { ListNewsletterSubscribersHandler } from './handlers/list-newsletter-subscribers.handler';
import { GetNewsletterPreferencesHandler } from './handlers/newsletter-preferences.handler';
import { UpdateNewsletterPreferencesHandler } from './handlers/newsletter-preferences.handler';
import { RunNewsletterIngestionHandler } from './handlers/run-newsletter-ingestion.handler';
import { SubscribeNewsletterHandler } from './handlers/subscribe-newsletter.handler';
import { UnsubscribeNewsletterHandler } from './handlers/unsubscribe-newsletter.handler';
import { NewsletterAdminController } from './newsletter-admin.controller';
import { NewsletterFeedService } from './newsletter-feed.service';
import { NewsletterIngestionService } from './newsletter-ingestion.service';
import { NewsletterPublicController } from './newsletter-public.controller';
import { NewsletterSubscriberService } from './newsletter-subscriber.service';

@Module({
  imports: [PrismaModule, AdminModule],
  controllers: [NewsletterAdminController, NewsletterPublicController],
  providers: [
    // Services
    NewsletterFeedService,
    NewsletterIngestionService,
    NewsletterSubscriberService,
    // Feed handlers
    CreateNewsletterFeedHandler,
    ListNewsletterFeedsHandler,
    RunNewsletterIngestionHandler,
    // Subscriber handlers
    SubscribeNewsletterHandler,
    GetNewsletterPreferencesHandler,
    UpdateNewsletterPreferencesHandler,
    UnsubscribeNewsletterHandler,
    ListNewsletterSubscribersHandler,
    // Guards / infra
    AdminSessionGuard,
    AdminPermissionGuard,
    LoggerProvider,
  ],
  exports: [NewsletterFeedService, NewsletterIngestionService, NewsletterSubscriberService],
})
export class NewsletterModule {}
