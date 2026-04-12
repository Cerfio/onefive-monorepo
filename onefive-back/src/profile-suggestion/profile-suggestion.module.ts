import { Module } from '@nestjs/common';
import { ProfileSuggestionController } from './profile-suggestion.controller';
import { ProfileSuggestionService } from './profile-suggestion.service';
import { GetProfileSuggestionHandler } from './handlers/get-profile-suggestion.handler';
import { ToggleProfileFollowHandler } from './handlers/toggle-profile-follow.handler';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [ProfileSuggestionController],
  providers: [
    LoggerProvider,
    ProfileSuggestionService,
    GetProfileSuggestionHandler,
    ToggleProfileFollowHandler,
    PrismaService,
  ],
  exports: [ProfileSuggestionService],
})
export class ProfileSuggestionModule {}
