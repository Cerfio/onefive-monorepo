import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { ProfileStatisticsService } from '../profile-statistics.service';
import { ProfileStatisticsResponseDto } from '../dto/get-profile-statistics.dto';

@Injectable()
export class GetProfileStatisticsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileStatisticsService: ProfileStatisticsService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }): Promise<ProfileStatisticsResponseDto> {
    return await this.profileStatisticsService.get({
      transactionId,
      userId,
    });
  }
}
