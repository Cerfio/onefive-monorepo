import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileController } from './controllers/file.controller';
import { UploadFileController } from './controllers/upload-file.controller';
import { FileHandler } from './handlers/file.handler';
import { UploadFileHandler } from './handlers/upload-file.handler';
import { FileService } from './services/file.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../../storage/storage.module';
import { SessionsModule } from '../../sessions/sessions.module';
import { LoggerProvider } from '../../common/logger/logger.provider';

@Module({
  imports: [PrismaModule, StorageModule, SessionsModule, ConfigModule],
  controllers: [FileController, UploadFileController],
  providers: [FileHandler, UploadFileHandler, FileService, LoggerProvider],
  exports: [FileService],
})
export class FileModule {}
