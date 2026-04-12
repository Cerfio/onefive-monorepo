import { Module } from '@nestjs/common';
import { PostReactionService } from './post-reaction.service';
import { PostReactionController } from './post-reaction.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileModule } from '../profile/profile.module';
import { NotificationModule } from '../notification/notification.module';

// Handlers
import { CreatePostReactionHandler } from './handlers/create-post-reaction.handler';
import { GetPostReactionHandler } from './handlers/get-post-reaction.handler';
import { ListPostReactionsHandler } from './handlers/list-post-reactions.handler';
import { UpdatePostReactionHandler } from './handlers/update-post-reaction.handler';
import { DeletePostReactionHandler } from './handlers/delete-post-reaction.handler';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { SessionsModule } from 'src/sessions/sessions.module';
import { StreakModule } from 'src/streak/streak.module';
import { FollowsModule } from 'src/follows/follows.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    SessionsModule,
    ProfileModule,
    StreakModule,
    FollowsModule,
    StorageModule,
    NotificationModule,
  ],
  controllers: [PostReactionController],
  providers: [
    PostReactionService,

    // Handlers
    CreatePostReactionHandler,
    GetPostReactionHandler,
    ListPostReactionsHandler,
    UpdatePostReactionHandler,
    DeletePostReactionHandler,
    LoggerProvider,
  ],
  exports: [PostReactionService],
})
export class PostReactionModule {}
