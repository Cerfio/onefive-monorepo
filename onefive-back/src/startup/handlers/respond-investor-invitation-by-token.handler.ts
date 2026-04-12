import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class RespondInvestorInvitationByTokenHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    token,
    action,
  }: {
    transactionId: string;
    userId: string;
    token: string;
    action: 'accept' | 'decline';
  }) {
    this.logger.info('Responding to investor invitation by token', {
      transactionId,
      userId,
      token,
      action,
    });

    return this.startupService.respondToInvestorInvitationByToken({
      transactionId,
      userId,
      token,
      action,
    });
  }
}
