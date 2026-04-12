import { Module } from '@nestjs/common';
import { StartupInvitationController } from './controllers/startup-invitation.controller';
import { CreateStartupInvitationHandler } from './handlers/create-invitation.handler';
import { ListStartupInvitationsHandler } from './handlers/list-invitations.handler';
import { RespondStartupInvitationHandler } from './handlers/respond-invitation.handler';
import { CancelStartupInvitationHandler } from './handlers/cancel-invitation.handler';
import { StartupModule } from '../startup/startup.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { SessionsModule } from 'src/sessions/sessions.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [StartupModule, PrismaModule, SessionsModule, NotificationModule],
  controllers: [StartupInvitationController],
  providers: [
    CreateStartupInvitationHandler,
    ListStartupInvitationsHandler,
    RespondStartupInvitationHandler,
    CancelStartupInvitationHandler,
    LoggerProvider,
  ],
  exports: [
    CreateStartupInvitationHandler,
    ListStartupInvitationsHandler,
    RespondStartupInvitationHandler,
    CancelStartupInvitationHandler,
  ],
})
export class StartupInvitationModule {}
