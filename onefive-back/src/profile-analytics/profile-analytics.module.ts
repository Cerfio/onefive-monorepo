import { Module } from '@nestjs/common';
import { ProfileAnalyticsController } from './profile-analytics.controller';
import { ProfileAnalyticsService } from './profile-analytics.service';
import { GetVisitorsAnalyticsHandler } from './handlers/get-visitors-analytics.handler';
import { GetEngagementAnalyticsHandler } from './handlers/get-engagement-analytics.handler';
import { GetOverviewAnalyticsHandler } from './handlers/get-overview-analytics.handler';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { StorageModule } from 'src/storage/storage.module';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  controllers: [ProfileAnalyticsController],
  providers: [
    LoggerProvider,
    ProfileAnalyticsService,
    GetVisitorsAnalyticsHandler,
    GetEngagementAnalyticsHandler,
    GetOverviewAnalyticsHandler,
    PrismaService,
  ],
  imports: [StorageModule, SessionsModule],
  exports: [ProfileAnalyticsService],
})
export class ProfileAnalyticsModule {}
