import { Module } from '@nestjs/common';
import { GeolocationService } from './geolocation.service';
import { LoggerProvider } from '../logger/logger.provider';

@Module({
  providers: [LoggerProvider, GeolocationService],
  exports: [GeolocationService],
})
export class GeolocationModule {}
