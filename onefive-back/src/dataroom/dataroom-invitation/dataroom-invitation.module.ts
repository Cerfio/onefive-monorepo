import { Module } from '@nestjs/common';
import { DataroomInvitationController } from './controllers/dataroom-invitation.controller';
import { DataroomInvitationService } from './services/dataroom-invitation.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../email/email.module';
import { SessionsModule } from 'src/sessions/sessions.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  imports: [PrismaModule, SessionsModule, EmailModule],
  controllers: [DataroomInvitationController],
  providers: [DataroomInvitationService, LoggerProvider],
  exports: [DataroomInvitationService],
})
export class DataroomInvitationModule {}
