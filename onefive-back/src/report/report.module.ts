import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { CreateReportHandler } from './handlers/create-report.handler';
import { LoggerProvider } from '../common/logger/logger.provider';

@Module({
  controllers: [ReportController],
  providers: [ReportService, CreateReportHandler, LoggerProvider],
  exports: [ReportService],
})
export class ReportModule {}
