import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  providers: [EmailService, LoggerProvider],
  exports: [EmailService],
})
export class EmailModule {}
