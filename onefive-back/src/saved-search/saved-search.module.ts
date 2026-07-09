import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsModule } from '../sessions/sessions.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { SavedSearchController } from './saved-search.controller';
import { SavedSearchService } from './saved-search.service';

@Module({
  imports: [PrismaModule, SessionsModule],
  controllers: [SavedSearchController],
  providers: [SavedSearchService, LoggerProvider],
})
export class SavedSearchModule {}
