import { Module, forwardRef } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { CreateProfileHandler } from './handlers/create-profile.handler';
import { SelfProfileHandler } from './handlers/self-profile.handler';
import { GetProfileHandler } from './handlers/get-profile.handler';
import { UsersService } from 'src/users/users.service';
import { StreakModule } from 'src/streak/streak.module';
import { MeProfileHandler } from './handlers/me-profile.handler';
import { UpdateProfileHandler } from './handlers/update-profile.handler';
import { UpdateSkillsInterestsHandler } from './handlers/update-skills-interests.handler';
import { BatchUpdateAchievementsHandler } from './handlers/batch-update-achievements.handler';
import { SearchProfilesHandler } from './handlers/search-profiles.handler';
import { AchievementService } from './achievement.service';
import { ProfileRelationshipsModule } from 'src/profile-relationships/profile-relationships.module';
import { StorageModule } from 'src/storage/storage.module';
import { ConfigModule } from '@nestjs/config';
import { FollowsModule } from 'src/follows/follows.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { NotificationModule } from 'src/notification/notification.module';
import { WaitlistModule } from 'src/waitlist/waitlist.module';

@Module({
  imports: [
    StreakModule,
    ProfileRelationshipsModule,
    StorageModule,
    ConfigModule,
    forwardRef(() => FollowsModule),
    PrismaModule,
    SessionsModule,
    NotificationModule,
    WaitlistModule,
  ],
  controllers: [ProfileController],
  providers: [
    LoggerProvider,
    ProfileService,
    AchievementService,
    CreateProfileHandler,
    SelfProfileHandler,
    GetProfileHandler,
    MeProfileHandler,
    UpdateProfileHandler,
    UpdateSkillsInterestsHandler,
    BatchUpdateAchievementsHandler,
    SearchProfilesHandler,
    UsersService,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}
