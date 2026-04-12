import { Module } from '@nestjs/common';
import { ProfileStatisticsController } from './profile-statistics.controller';
import { ProfileStatisticsService } from './profile-statistics.service';
import { GetProfileStatisticsHandler } from './handlers/get-profile-statistics.handler';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { StreakModule } from 'src/streak/streak.module';

@Module({
  controllers: [ProfileStatisticsController],
  providers: [
    LoggerProvider,
    ProfileStatisticsService,
    GetProfileStatisticsHandler,
    PrismaService,
  ],
  imports: [StreakModule],
  exports: [ProfileStatisticsService],
})
export class ProfileStatisticsModule {}
