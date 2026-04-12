import { Module } from '@nestjs/common';
import { AdminModule } from 'src/admin/admin.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminPermissionGuard } from 'src/admin/guards/admin-permission.guard';
import { AdminSessionGuard } from 'src/admin/guards/admin-session.guard';
import { CreateNewsletterFeedHandler } from './handlers/create-newsletter-feed.handler';
import { ListNewsletterFeedsHandler } from './handlers/list-newsletter-feeds.handler';
import { RunNewsletterIngestionHandler } from './handlers/run-newsletter-ingestion.handler';
import { NewsletterAdminController } from './newsletter-admin.controller';
import { NewsletterFeedService } from './newsletter-feed.service';
import { NewsletterIngestionService } from './newsletter-ingestion.service';

@Module({
  imports: [PrismaModule, AdminModule],
  controllers: [NewsletterAdminController],
  providers: [
    NewsletterFeedService,
    NewsletterIngestionService,
    CreateNewsletterFeedHandler,
    ListNewsletterFeedsHandler,
    RunNewsletterIngestionHandler,
    AdminSessionGuard,
    AdminPermissionGuard,
    LoggerProvider,
  ],
  exports: [NewsletterFeedService, NewsletterIngestionService],
})
export class NewsletterModule {}
