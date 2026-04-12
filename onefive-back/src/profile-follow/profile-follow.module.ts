import { Module } from '@nestjs/common';
import { ProfileFollowController } from './profile-follow.controller';
import { ProfileFollowService } from './profile-follow.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileModule } from '../profile/profile.module';
import { NotificationModule } from '../notification/notification.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { FollowProfileHandler } from './handlers/follow-profile.handler';
import { UnfollowProfileHandler } from './handlers/unfollow-profile.handler';
import { IsFollowingProfileHandler } from './handlers/is-following-profile.handler';
import { ListFollowersHandler } from './handlers/list-followers.handler';
import { ListFollowingHandler } from './handlers/list-following.handler';

@Module({
  imports: [PrismaModule, ProfileModule, NotificationModule],
  controllers: [ProfileFollowController],
  providers: [
    ProfileFollowService,
    FollowProfileHandler,
    UnfollowProfileHandler,
    IsFollowingProfileHandler,
    ListFollowersHandler,
    ListFollowingHandler,
    LoggerProvider,
  ],
  exports: [ProfileFollowService],
})
export class ProfileFollowModule {}
