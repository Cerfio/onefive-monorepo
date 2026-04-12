import { Module } from '@nestjs/common';
import { PostBookmarkController } from './post-bookmark.controller';
import { PostBookmarkService } from './post-bookmark.service';
import { GetPostBookmarkHandler } from './handlers/get-post-bookmark.handler';
import { CreatePostBookmarkHandler } from './handlers/create-post-bookmark.handler';
import { DeletePostBookmarkHandler } from './handlers/delete-post-bookmark.handler';
import { TogglePostBookmarkHandler } from './handlers/toggle-post-bookmark.handler';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  controllers: [PostBookmarkController],
  providers: [
    LoggerProvider,
    PostBookmarkService,
    GetPostBookmarkHandler,
    CreatePostBookmarkHandler,
    DeletePostBookmarkHandler,
    TogglePostBookmarkHandler,
  ],
  exports: [PostBookmarkService],
})
export class PostBookmarkModule {}
