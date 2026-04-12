import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { GetCitySuggestionsHandler } from './handlers/get-city-suggestions.handler';
import { LoggerProvider } from 'src/common/logger/logger.provider';

@Module({
  controllers: [LocationController],
  providers: [LocationService, GetCitySuggestionsHandler, LoggerProvider],
  exports: [LocationService],
})
export class LocationModule {}
