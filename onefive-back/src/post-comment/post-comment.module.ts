import { Module } from '@nestjs/common';
import { PostCommentService } from './post-comment.service';
import { PostCommentController } from './post-comment.controller';

// Handlers
import { CreatePostCommentHandler } from './handlers/create-post-comment.handler';
import { GetPostCommentHandler } from './handlers/get-post-comment.handler';
import { ListPostCommentsHandler } from './handlers/list-post-comments.handler';
import { UpdatePostCommentHandler } from './handlers/update-post-comment.handler';
import { DeletePostCommentHandler } from './handlers/delete-post-comment.handler';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { SessionsModule } from 'src/sessions/sessions.module';
import { StreakModule } from 'src/streak/streak.module';
import { ProfileModule } from 'src/profile/profile.module';
import { StorageModule } from 'src/storage/storage.module';
import { FollowsModule } from 'src/follows/follows.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    SessionsModule,
    StreakModule,
    ProfileModule,
    StorageModule,
    FollowsModule,
    NotificationModule,
  ],
  controllers: [PostCommentController],
  providers: [
    PostCommentService,
    // Handlers
    CreatePostCommentHandler,
    GetPostCommentHandler,
    ListPostCommentsHandler,
    UpdatePostCommentHandler,
    DeletePostCommentHandler,
    LoggerProvider,
  ],
  exports: [PostCommentService],
})
export class PostCommentModule {}
