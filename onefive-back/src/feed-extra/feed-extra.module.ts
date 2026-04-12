import { Module } from '@nestjs/common';
import { FeedExtraController } from './feed-extra.controller';
import { FeedExtraService } from './feed-extra.service';
import { ListProfileSuggestionsHandler } from './handlers/list-profile-suggestions.handler';
import { ListStartupSuggestionsHandler } from './handlers/list-startup-suggestions.handler';
import { GetProfileStatisticsHandler } from './handlers/get-profile-statistics.handler';
import { ListBookmarksHandler } from './handlers/list-bookmarks.handler';
import { ToggleBookmarkHandler } from './handlers/toggle-bookmark.handler';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [FeedExtraController],
  providers: [
    LoggerProvider,
    FeedExtraService,
    ListProfileSuggestionsHandler,
    ListStartupSuggestionsHandler,
    GetProfileStatisticsHandler,
    ListBookmarksHandler,
    ToggleBookmarkHandler,
    PrismaService,
  ],
  exports: [FeedExtraService],
})
export class FeedExtraModule {}
