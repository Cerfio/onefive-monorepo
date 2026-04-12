import { Module } from '@nestjs/common';
import { ProfilePostController } from './profile-post.controller';
import { ListProfilePostsHandler } from './handlers/list-profile-posts.handler';
import { PostModule } from '../post/post.module';
import { ProfileModule } from '../profile/profile.module';
import { StreakModule } from '../streak/streak.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [
    PostModule,
    ProfileModule,
    StreakModule,
    PrismaModule,
    SessionsModule,
  ],
  controllers: [ProfilePostController],
  providers: [ListProfilePostsHandler, LoggerProvider],
})
export class ProfilePostModule {}
