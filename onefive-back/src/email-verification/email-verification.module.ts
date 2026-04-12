import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../email/email.module';
import { SendVerificationCodeHandler } from './handlers/send-verification-code.handler';
import { VerifyEmailCodeHandler } from './handlers/verify-email-code.handler';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { WaitlistModule } from '../waitlist/waitlist.module';

@Module({
  imports: [EmailModule, WaitlistModule],
  providers: [
    EmailVerificationService,

    SendVerificationCodeHandler,
    VerifyEmailCodeHandler,
    LoggerProvider,
  ],
  exports: [
    EmailVerificationService,
    SendVerificationCodeHandler,
    VerifyEmailCodeHandler,
  ],
})
export class EmailVerificationModule {}
