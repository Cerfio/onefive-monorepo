import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetInvestorInvitationByTokenHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
  ) {}

  @Log()
  async execute({
    transactionId,
    token,
  }: {
    transactionId: string;
    token: string;
  }) {
    this.logger.info('Getting investor invitation by token', {
      transactionId,
      token,
    });

    return this.startupService.getInvestorInvitationByToken({
      transactionId,
      token,
    });
  }
}
