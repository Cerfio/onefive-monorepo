import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { ProfileSuggestionService } from '../profile-suggestion.service';

@Injectable()
export class ToggleProfileFollowHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileSuggestionService: ProfileSuggestionService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }): Promise<{ following: boolean }> {
    this.logger.info('Toggling profile follow', {
      transactionId,
      userId,
      profileId,
    });

    return await this.profileSuggestionService.toggleFollow({
      transactionId,
      userId,
      profileId,
    });
  }
}
