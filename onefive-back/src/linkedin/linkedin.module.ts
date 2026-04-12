import { Module } from '@nestjs/common';
import { LinkedinService } from './linkedin.service';
import { LoggerProvider } from '../common/logger/logger.provider';

@Module({
  providers: [LinkedinService, LoggerProvider],
  exports: [LinkedinService],
})
export class LinkedinModule {}
