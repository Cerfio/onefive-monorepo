import { Module } from '@nestjs/common';
import { DataroomController } from './controllers/dataroom.controller';
import { DataroomHandler } from './handlers/dataroom.handler';
import { TrackingEventsHandler } from './handlers/tracking-events.handler';
import { AnalyticsHandler } from './handlers/analytics.handler';
import { FileAnalyticsHandler } from './handlers/file-analytics.handler';
import { UserAnalyticsHandler } from './handlers/user-analytics.handler';
import { TimelineHandler } from './handlers/timeline.handler';
import { DataroomService } from './services/dataroom.service';
import { TrackingService } from './services/tracking.service';
import { FileAnalyticsService } from './services/file-analytics.service';
import { UserAnalyticsService } from './services/user-analytics.service';
import { TimelineService } from './services/timeline.service';
import { MemberService } from './services/member.service';
import { FileModule } from './file/file.module';
import { DataroomFileSignedUrlModule } from './dataroom-file-signed-url/dataroom-file-signed-url.module';
import { DataroomFileRenderModule } from './dataroom-file-render/dataroom-file-render.module';
import { DataroomCategoryModule } from './dataroom-category/dataroom-category.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsModule } from '../sessions/sessions.module';
import { NotificationModule } from '../notification/notification.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { DataroomMemberGuard } from './guards/dataroom-member.guard';
import { DataroomOwnerGuard } from './guards/dataroom-owner.guard';

@Module({
  imports: [
    PrismaModule,
    SessionsModule,
    FileModule,
    DataroomFileSignedUrlModule,
    DataroomFileRenderModule,
    DataroomCategoryModule,
    NotificationModule,
  ],
  controllers: [DataroomController],
  providers: [
    DataroomHandler,
    TrackingEventsHandler,
    AnalyticsHandler,
    FileAnalyticsHandler,
    UserAnalyticsHandler,
    TimelineHandler,
    DataroomService,
    TrackingService,
    FileAnalyticsService,
    UserAnalyticsService,
    TimelineService,
    MemberService,
    DataroomMemberGuard,
    DataroomOwnerGuard,
    LoggerProvider,
  ],
  exports: [DataroomService, TrackingService, MemberService, DataroomHandler],
})
export class DataroomModule {}
