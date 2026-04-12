import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { LoggerProvider } from '../common/logger/logger.provider';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [TwilioService, LoggerProvider, ConfigService],
  exports: [TwilioService],
})
export class TwilioModule {}
