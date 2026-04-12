import { Module } from '@nestjs/common';
import { ProfileConnectionController } from './profile-connection.controller';
import { ProfileConnectionService } from './profile-connection.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfileModule } from '../profile/profile.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { SendConnectionRequestHandler } from './handlers/send-connection-request.handler';
import { AcceptConnectionHandler } from './handlers/accept-connection.handler';
import { RejectConnectionHandler } from './handlers/reject-connection.handler';
import { DeleteConnectionHandler } from './handlers/delete-connection.handler';
import { ListConnectionsHandler } from './handlers/list-connections.handler';
import { ListPendingConnectionsHandler } from './handlers/list-pending-connections.handler';
import { GetConnectionStatusHandler } from './handlers/get-connection-status.handler';

@Module({
  imports: [PrismaModule, ProfileModule],
  controllers: [ProfileConnectionController],
  providers: [
    ProfileConnectionService,
    SendConnectionRequestHandler,
    AcceptConnectionHandler,
    RejectConnectionHandler,
    DeleteConnectionHandler,
    ListConnectionsHandler,
    ListPendingConnectionsHandler,
    GetConnectionStatusHandler,
    LoggerProvider,
  ],
  exports: [ProfileConnectionService],
})
export class ProfileConnectionModule {}
