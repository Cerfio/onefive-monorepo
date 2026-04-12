import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { LoggerProvider } from '../common/logger/logger.provider';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [StorageController],
  providers: [StorageService, LoggerProvider, ConfigService],
  exports: [StorageService],
})
export class StorageModule {}
