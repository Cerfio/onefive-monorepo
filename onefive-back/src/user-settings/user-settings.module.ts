import { Module } from '@nestjs/common';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { EmailModule } from 'src/email/email.module';
import { GetUserSettingsHandler } from './handlers/get-user-settings.handler';
import { UpdateNotificationsHandler } from './handlers/update-notifications.handler';
import { UpdatePrivacyHandler } from './handlers/update-privacy.handler';
import { UpdatePreferencesHandler } from './handlers/update-preferences.handler';
import { UpdatePasswordHandler } from './handlers/update-password.handler';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [EmailModule],
  controllers: [UserSettingsController],
  providers: [
    LoggerProvider,
    UserSettingsService,
    GetUserSettingsHandler,
    UpdateNotificationsHandler,
    UpdatePrivacyHandler,
    UpdatePreferencesHandler,
    UpdatePasswordHandler,
    UsersService,
  ],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
