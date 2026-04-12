import { Module } from '@nestjs/common';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { GetReferralStatsHandler } from './handlers/get-stats.handler';
import { GetLeaderboardHandler } from './handlers/get-leaderboard.handler';
import { ListMyReferralsHandler } from './handlers/list-my-referrals.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [PrismaModule, SessionsModule, NotificationModule],
  controllers: [ReferralController],
  providers: [
    ReferralService,
    GetReferralStatsHandler,
    GetLeaderboardHandler,
    ListMyReferralsHandler,
    LoggerProvider,
  ],
  exports: [ReferralService],
})
export class ReferralModule {}
