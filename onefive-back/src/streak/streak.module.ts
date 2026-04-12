import { Module } from '@nestjs/common';
import { StreakService } from './streak.service';
import { StreakController } from './streak.controller';
import { CreateStreakHandler } from './handlers/create-streak.handler';
import { LoggerProvider } from '../common/logger/logger.provider';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  imports: [SessionsModule],
  controllers: [StreakController],
  providers: [StreakService, CreateStreakHandler, LoggerProvider],
  exports: [StreakService],
})
export class StreakModule {}
