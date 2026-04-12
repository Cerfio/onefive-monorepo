import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';
import { UpdateFundingDto } from '../dto/update-funding.dto';

@Injectable()
export class GetFundingHandler {
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
    this.logger.info('Getting funding', {
      transactionId,
      startupId,
    });

    const funding = await this.startupService.getFunding({
      transactionId,
      startupId,
    });

    return funding;
  }
}
