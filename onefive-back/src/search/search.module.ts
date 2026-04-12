import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchBarHandler } from './handlers/searchbar.handler';
import { SearchHandler } from './handlers/search.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileModule } from '../profile/profile.module';
import { SessionsModule } from '../sessions/sessions.module';
import { StorageModule } from '../storage/storage.module';
import { LoggerProvider } from '../common/logger/logger.provider';

@Module({
  imports: [PrismaModule, ProfileModule, SessionsModule, StorageModule],
  controllers: [SearchController],
  providers: [LoggerProvider, SearchBarHandler, SearchHandler],
  exports: [SearchBarHandler, SearchHandler],
})
export class SearchModule {}
