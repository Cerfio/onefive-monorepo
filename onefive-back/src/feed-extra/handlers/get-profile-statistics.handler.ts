import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { FeedExtraService } from '../feed-extra.service';
import { ProfileStatisticsResponseDto } from '../dto/get-profile-statistics.dto';

@Injectable()
export class GetProfileStatisticsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly feedExtraService: FeedExtraService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }): Promise<ProfileStatisticsResponseDto> {
    this.logger.info('Getting profile statistics', {
      transactionId,
      userId,
    });

    return await this.feedExtraService.getProfileStatistics({
      transactionId,
      userId,
    });
  }
}
