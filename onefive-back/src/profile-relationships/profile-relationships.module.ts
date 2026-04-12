import { Module } from '@nestjs/common';
import { ProfileRelationshipsController } from './profile-relationships.controller';
import { ProfileRelationshipsService } from './profile-relationships.service';
import { CreateConnectionHandler } from './handlers/create-connection.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { SessionsModule } from '../sessions/sessions.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, SessionsModule, NotificationModule],
  controllers: [ProfileRelationshipsController],
  providers: [
    LoggerProvider,
    ProfileRelationshipsService,
    CreateConnectionHandler,
  ],
  exports: [ProfileRelationshipsService, CreateConnectionHandler],
})
export class ProfileRelationshipsModule {}
