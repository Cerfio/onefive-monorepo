import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SignedUrlController } from './controllers/signed-url.controller';
import { SignedUrlHandler } from './handlers/signed-url.handler';
import { SignedUrlService } from './services/signed-url.service';
import { FileModule } from '../file/file.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { SessionsModule } from '../../sessions/sessions.module';
import { LoggerProvider } from '../../common/logger/logger.provider';
import { StorageModule } from '../../storage/storage.module';

@Module({
  imports: [ConfigModule, FileModule, PrismaModule, SessionsModule, StorageModule],
  controllers: [SignedUrlController],
  providers: [SignedUrlHandler, SignedUrlService, LoggerProvider],
  exports: [SignedUrlService],
})
export class DataroomFileSignedUrlModule {}
