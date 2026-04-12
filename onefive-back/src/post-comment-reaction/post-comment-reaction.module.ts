import { Module } from '@nestjs/common';
import { PostCommentReactionController } from './post-comment-reaction.controller';
import { PostCommentReactionService } from './post-comment-reaction.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionsModule } from 'src/sessions/sessions.module';
import { ProfileModule } from 'src/profile/profile.module';
import { NotificationModule } from 'src/notification/notification.module';

// Handlers
import { CreatePostCommentReactionHandler } from './handlers/create-post-comment-reaction.handler';
import { UpdatePostCommentReactionHandler } from './handlers/update-post-comment-reaction.handler';
import { DeletePostCommentReactionHandler } from './handlers/delete-post-comment-reaction.handler';
import { ListPostCommentReactionsHandler } from './handlers/list-post-comment-reactions.handler';

@Module({
  imports: [SessionsModule, ProfileModule, NotificationModule],
  controllers: [PostCommentReactionController],
  providers: [
    LoggerProvider,
    PrismaService,
    PostCommentReactionService,
    CreatePostCommentReactionHandler,
    UpdatePostCommentReactionHandler,
    DeletePostCommentReactionHandler,
    ListPostCommentReactionsHandler,
  ],
  exports: [PostCommentReactionService],
})
export class PostCommentReactionModule {}
