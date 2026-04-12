import { Module } from '@nestjs/common';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';
import { ListNetworkActivityHandler } from './handlers/list-network-activity.handler';
import { ListNetworkPeopleHandler } from './handlers/list-network-people.handler';
import { ListNetworkStartupsHandler } from './handlers/list-network-startups.handler';
import { ConnectProfileHandler } from './handlers/connect-profile.handler';
import { AcceptConnectionHandler } from './handlers/accept-connection.handler';
import { CancelConnectionHandler } from './handlers/cancel-connection.handler';
import { FollowProfileHandler } from './handlers/follow-profile.handler';
import { UnfollowProfileHandler } from './handlers/unfollow-profile.handler';
import { FollowStartupHandler } from './handlers/follow-startup.handler';
import { UnfollowStartupHandler } from './handlers/unfollow-startup.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { SessionsModule } from '../sessions/sessions.module';
import { StorageModule } from 'src/storage/storage.module';
import { NotificationModule } from '../notification/notification.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
    PrismaModule,
    SessionsModule,
    StorageModule,
    NotificationModule,
    ProfileModule,
  ],
  controllers: [NetworkController],
  providers: [
    NetworkService,
    ListNetworkActivityHandler,
    ListNetworkPeopleHandler,
    ListNetworkStartupsHandler,
    // deprecated endpoints removed
    ConnectProfileHandler,
    AcceptConnectionHandler,
    CancelConnectionHandler,
    FollowProfileHandler,
    UnfollowProfileHandler,
    FollowStartupHandler,
    UnfollowStartupHandler,
    LoggerProvider,
  ],
  exports: [
    NetworkService,
    ListNetworkActivityHandler,
    ListNetworkPeopleHandler,
    ListNetworkStartupsHandler,
    // deprecated endpoints removed
    ConnectProfileHandler,
    AcceptConnectionHandler,
    CancelConnectionHandler,
    FollowProfileHandler,
    UnfollowProfileHandler,
    FollowStartupHandler,
    UnfollowStartupHandler,
  ],
})
export class NetworkModule {}
