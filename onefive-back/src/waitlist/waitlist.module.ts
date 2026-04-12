import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { GetWaitlistStatusHandler } from './handlers/get-waitlist-status.handler';
import { GetWaitlistLeaderboardHandler } from './handlers/get-waitlist-leaderboard.handler';
import { ToggleLeaderboardOptInHandler } from './handlers/toggle-leaderboard-opt-in.handler';
import { GetReferrerByCodeHandler } from './handlers/get-referrer-by-code.handler';
import { GetMyReferrerHandler } from './handlers/get-my-referrer.handler';
import { SelfActivateWaitlistHandler } from './handlers/self-activate-waitlist.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { SessionsModule } from 'src/sessions/sessions.module';
import { StorageModule } from '../storage/storage.module';
import { EmailModule } from '../email/email.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, SessionsModule, EmailModule, NotificationModule, StorageModule],
  controllers: [WaitlistController],
  providers: [
    WaitlistService,
    GetWaitlistStatusHandler,
    GetWaitlistLeaderboardHandler,
    ToggleLeaderboardOptInHandler,
    GetReferrerByCodeHandler,
    GetMyReferrerHandler,
    SelfActivateWaitlistHandler,
    LoggerProvider,
  ],
  exports: [WaitlistService],
})
export class WaitlistModule {}
