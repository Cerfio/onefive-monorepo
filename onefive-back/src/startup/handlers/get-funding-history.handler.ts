import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetFundingHistoryHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
  ) {}

  @Log()
  async execute({
    transactionId,
    startupId,
  }: {
    transactionId: string;
    startupId: string;
  }) {
    this.logger.info('Getting funding history', {
      transactionId,
      startupId,
    });

    const history = await this.startupService.getFundingHistory({
      transactionId,
      startupId,
    });

    return history;
  }
}
