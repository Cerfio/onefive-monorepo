import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { StartupSuggestionService } from '../startup-suggestion.service';
import { StartupSuggestionResponseDto } from '../dto/get-startup-suggestion.dto';

@Injectable()
export class GetStartupSuggestionHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupSuggestionService: StartupSuggestionService,
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
    return await this.startupSuggestionService.get({
      transactionId,
      userId,
      limit,
      skip,
    });
  }
}
