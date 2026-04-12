import { Module } from '@nestjs/common';
import { ProfileAvatarController } from './profile-avatar.controller';
import { UploadAvatarHandler } from './handlers/upload-avatar.handler';
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
  controllers: [ProfileAvatarController],
  providers: [LoggerProvider, UploadAvatarHandler, FileProcessingService],
})
export class ProfileAvatarModule {}
