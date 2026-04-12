import { Module } from '@nestjs/common';
import { StartupSuggestionController } from './startup-suggestion.controller';
import { StartupSuggestionService } from './startup-suggestion.service';
import { GetStartupSuggestionHandler } from './handlers/get-startup-suggestion.handler';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { FollowsModule } from '../follows/follows.module';

@Module({
  imports: [FollowsModule],
  controllers: [StartupSuggestionController],
  providers: [
    LoggerProvider,
    StartupSuggestionService,
    GetStartupSuggestionHandler,
    PrismaService,
  ],
  exports: [StartupSuggestionService],
})
export class StartupSuggestionModule {}
