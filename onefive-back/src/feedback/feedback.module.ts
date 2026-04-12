import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackHandler } from './handlers/create-feedback.handler';
import { LoggerProvider } from '../common/logger/logger.provider';
import { StorageModule } from '../storage/storage.module';
import { FileModule } from '../file/file.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [StorageModule, FileModule, PrismaModule, ConfigModule],
  controllers: [FeedbackController],
  providers: [FeedbackService, CreateFeedbackHandler, LoggerProvider],
  exports: [FeedbackService],
})
export class FeedbackModule {}
