import { Module } from '@nestjs/common';
import { SpotlightController } from './spotlight.controller';
import { SpotlightService } from './spotlight.service';
import { ListSpotlightHandler } from './handlers/list-spotlight.handler';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  controllers: [SpotlightController],
  providers: [SpotlightService, ListSpotlightHandler, LoggerProvider],
  exports: [SpotlightService],
})
export class SpotlightModule {}
