import { Module } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetRequestHandler } from './handlers/password-reset-request.handler';
import { PasswordResetVerifyHandler } from './handlers/password-reset-verify.handler';
import { PasswordResetConfirmHandler } from './handlers/password-reset-confirm.handler';
import { EmailModule } from '../email/email.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  imports: [EmailModule],
  controllers: [PasswordResetController],
  providers: [
    PasswordResetService,
    PasswordResetRequestHandler,
    PasswordResetVerifyHandler,
    PasswordResetConfirmHandler,
    LoggerProvider,
  ],
  exports: [
    PasswordResetService,
    PasswordResetRequestHandler,
    PasswordResetVerifyHandler,
    PasswordResetConfirmHandler,
  ],
})
export class PasswordResetModule {}
