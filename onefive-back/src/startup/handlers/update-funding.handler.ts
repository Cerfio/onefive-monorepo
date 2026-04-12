import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';
import { UpdateFundingDto } from '../dto/update-funding.dto';
import { StartupUpdateException } from '../startup.exception';

@Injectable()
export class UpdateFundingHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    startupId,
    data,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    data: UpdateFundingDto;
  }) {
    this.logger.info('Updating funding', {
      transactionId,
      userId,
      startupId,
      fields: Object.keys(data),
    });

    try {
      const funding = await this.startupService.updateFunding({
        transactionId,
        startupId,
        userId,
        data: {
          totalRaised: data.totalRaised,
          lastRound: data.lastRound,
          investors: data.investors,
          fundraisingType: data.fundraisingType,
          structuredRound: data.structuredRound,
          rollingInvestment: data.rollingInvestment,
        },
      });

      this.logger.info('Funding updated successfully', {
        transactionId,
        startupId,
        userId,
      });

      return funding;
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }
      StartupUpdateException.throw(this.logger, {
        transactionId,
        startupId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
