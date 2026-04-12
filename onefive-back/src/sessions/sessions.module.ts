import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { ListSessionsHandler } from './handlers/list-sessions.handler';
import { RevokeSessionHandler } from './handlers/revoke-session.handler';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { GeolocationModule } from 'src/common/geolocation/geolocation.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [PrismaModule, GeolocationModule, EmailModule],
  controllers: [SessionsController],
  providers: [
    LoggerProvider,
    SessionsService,
    ListSessionsHandler,
    RevokeSessionHandler,
  ],
  exports: [SessionsService],
})
export class SessionsModule {}
