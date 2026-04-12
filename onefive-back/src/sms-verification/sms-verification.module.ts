import { Module } from '@nestjs/common';
import { SmsVerificationService } from './sms-verification.service';
import { SmsRequestHandler } from './handlers/sms-request.handler';
import { SmsConfirmHandler } from './handlers/sms-confirm.handler';
import { LoggerProvider } from '../common/logger/logger.provider';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { TwilioModule } from 'src/twilio/twilio.module';

@Module({
  imports: [UsersModule, TwilioModule],
  providers: [
    SmsVerificationService,
    SmsRequestHandler,
    SmsConfirmHandler,
    LoggerProvider,

    ConfigService,
  ],
  exports: [SmsVerificationService, SmsRequestHandler, SmsConfirmHandler],
})
export class SmsVerificationModule {}
