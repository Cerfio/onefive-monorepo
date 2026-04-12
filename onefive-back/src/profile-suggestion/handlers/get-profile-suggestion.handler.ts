import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { ProfileSuggestionService } from '../profile-suggestion.service';
import { ProfileSuggestionResponseDto } from '../dto/get-profile-suggestion.dto';

@Injectable()
export class GetProfileSuggestionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileSuggestionService: ProfileSuggestionService,
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
    this.logger.info('Getting profile suggestions', {
      transactionId,
      userId,
      limit,
      skip,
    });

    return await this.profileSuggestionService.get({
      transactionId,
      userId,
      limit,
      skip,
    });
  }
}
