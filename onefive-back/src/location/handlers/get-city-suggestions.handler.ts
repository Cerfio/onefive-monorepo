import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { LocationService } from '../location.service';
import { LocationGetCitySuggestionsException } from '../location.exception';

@Injectable()
export class GetCitySuggestionsHandler {
  constructor(
    private readonly locationService: LocationService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    query,
    countryCode,
  }: {
    transactionId: string;
    query: string;
    countryCode: string;
  }) {
    try {
      const suggestions = await this.locationService.getCitySuggestions(
        query,
        countryCode,
      );
      return suggestions;
    } catch (error) {
      LocationGetCitySuggestionsException.throw(this.logger, {
        transactionId,
        query,
        countryCode,
        error: error.message,
      });
    }
  }
}
