import { Module } from '@nestjs/common';
import { ProfileCoverController } from './profile-cover.controller';
import { UploadCoverHandler } from './handlers/upload-cover.handler';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { StorageModule } from 'src/storage/storage.module';
import { ProfileModule } from 'src/profile/profile.module';
import { FileModule } from 'src/file/file.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileProcessingService } from 'src/common/services/file-processing.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    StorageModule,
    ProfileModule,
    FileModule,
    PrismaModule,
    ConfigModule,
  ],
  controllers: [ProfileCoverController],
  providers: [LoggerProvider, UploadCoverHandler, FileProcessingService],
})
export class ProfileCoverModule {}
