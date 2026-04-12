import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { FeedExtraService } from '../feed-extra.service';
import { StartupSuggestionResponseDto } from '../dto/get-startup-suggestions.dto';

@Injectable()
export class ListStartupSuggestionsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly feedExtraService: FeedExtraService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    limit = 10,
    skip = 0,
  }: {
    transactionId: string;
    userId: string;
    limit?: number;
    skip?: number;
  }): Promise<StartupSuggestionResponseDto[]> {
    this.logger.info('Listing startup suggestions', {
      transactionId,
      userId,
      limit,
      skip,
    });

    return await this.feedExtraService.getStartupSuggestions({
      transactionId,
      userId,
      limit,
      skip,
    });
  }
}
