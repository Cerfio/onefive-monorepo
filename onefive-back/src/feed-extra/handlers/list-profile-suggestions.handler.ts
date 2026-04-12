import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { FeedExtraService } from '../feed-extra.service';
import { ProfileSuggestionResponseDto } from '../dto/get-profile-suggestions.dto';

@Injectable()
export class ListProfileSuggestionsHandler {
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
  }): Promise<ProfileSuggestionResponseDto[]> {
    this.logger.info('Listing profile suggestions', {
      transactionId,
      userId,
      limit,
      skip,
    });

    return await this.feedExtraService.getProfileSuggestions({
      transactionId,
      userId,
      limit,
      skip,
    });
  }
}
