import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { LoggerProvider } from '../common/logger/logger.provider';

@Module({
  providers: [GoogleService, LoggerProvider],
  exports: [GoogleService],
})
export class GoogleModule {}
