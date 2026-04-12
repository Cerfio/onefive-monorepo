import { Module, forwardRef } from '@nestjs/common';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { FollowProfileHandler } from './handlers/follow-profile.handler';
import { UnfollowProfileHandler } from './handlers/unfollow-profile.handler';
import { FollowStartupHandler } from './handlers/follow-startup.handler';
import { UnfollowStartupHandler } from './handlers/unfollow-startup.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { SessionsModule } from '../sessions/sessions.module';
import { NotificationModule } from '../notification/notification.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
    PrismaModule,
    SessionsModule,
    NotificationModule,
    forwardRef(() => ProfileModule),
  ],
  controllers: [FollowsController],
  providers: [
    FollowsService,
    FollowProfileHandler,
    UnfollowProfileHandler,
    FollowStartupHandler,
    UnfollowStartupHandler,
    LoggerProvider,
  ],
  exports: [
    FollowsService,
    FollowProfileHandler,
    UnfollowProfileHandler,
    FollowStartupHandler,
    UnfollowStartupHandler,
  ],
})
export class FollowsModule {}
