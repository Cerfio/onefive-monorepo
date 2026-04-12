import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from '../profile/profile.service';
import { ProfileModule } from '../profile/profile.module';
import { StreakModule } from '../streak/streak.module';
import { StorageModule } from '../storage/storage.module';
import { FileProcessingService } from '../common/services/file-processing.service';

// Handlers
import { CreatePostHandler } from './handlers/create-post.handler';
import { ListPostsHandler } from './handlers/list-posts.handler';
import { UpdatePostHandler } from './handlers/update-post.handler';
import { DeletePostHandler } from './handlers/delete-post.handler';
import { CreateRepostHandler } from './handlers/create-repost.handler';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { SessionsModule } from 'src/sessions/sessions.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    ProfileModule,
    StreakModule,
    SessionsModule,
    StorageModule,
    NotificationModule,
  ],
  controllers: [PostController],
  providers: [
    PostService,
    FileProcessingService,

    // Handlers
    CreatePostHandler,
    ListPostsHandler,
    UpdatePostHandler,
    DeletePostHandler,
    CreateRepostHandler,
    LoggerProvider,
  ],
  exports: [PostService],
})
export class PostModule {}
