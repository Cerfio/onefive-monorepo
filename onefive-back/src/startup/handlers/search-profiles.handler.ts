import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class SearchProfilesHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    query,
    limit = 5,
  }: {
    transactionId: string;
    userId: string;
    query: string;
    limit?: number;
  }) {
    this.logger.info('Searching profiles', {
      transactionId,
      userId,
      query,
      limit,
    });

    const profiles = await this.startupService.searchProfiles({
      query,
      limit,
      excludeUserId: userId,
    });

    this.logger.info('Profiles search completed', {
      transactionId,
      userId,
      query,
      resultsCount: profiles.length,
    });

    return profiles.map((profile) => ({
      id: profile.id,
      name: `${profile.firstName} ${profile.lastName}`,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
      highlight: profile.highlight,
      countryCode: profile.countryCode,
    }));
  }
}
