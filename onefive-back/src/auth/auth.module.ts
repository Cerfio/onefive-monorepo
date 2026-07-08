import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { SignupHandler } from './handlers/signup.handler';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { UsersModule } from 'src/users/users.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { SigninHandler } from './handlers/signin.handler';
import { AuthLinkedinHandler } from './handlers/auth-linkedin.handler';
import { AuthGoogleHandler } from './handlers/auth-google.handler';
import { LinkedinModule } from '../linkedin/linkedin.module';
import { GoogleModule } from '../google/google.module';
import { SmsVerificationModule } from '../sms-verification/sms-verification.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { EmailModule } from '../email/email.module';
import { EmailHasVerifiedHandler } from './handlers/email-has-verified.handler';
import { EmailConfirmHandler } from './handlers/email-confirm.handler';
import { EmailRequestHandler } from './handlers/email-request.handler';
import { SecurityService } from '../common/security/security.service';
import { ReferralModule } from '../referral/referral.module';
import { OAuthStateModule } from './oauth-state/oauth-state.module';
import { PasswordResetModule } from '../password-reset/password-reset.module';
import { TwoFactorController } from './two-factor/two-factor.controller';
import { TwoFactorService } from './two-factor/two-factor.service';

@Module({
  imports: [
    UsersModule,
    SessionsModule,
    EmailModule,
    LinkedinModule,
    GoogleModule,
    SmsVerificationModule,
    EmailVerificationModule,
    ReferralModule,
    OAuthStateModule,
    PasswordResetModule,
  ],
  controllers: [AuthController, TwoFactorController],
  providers: [
    TwoFactorService,
    PrismaService,
    AuthService,
    SignupHandler,
    SigninHandler,
    AuthLinkedinHandler,
    AuthGoogleHandler,
    EmailHasVerifiedHandler,
    EmailConfirmHandler,
    EmailRequestHandler,
    SecurityService,
    LoggerProvider,
  ],
  exports: [AuthService],
})
export class AuthModule {}
