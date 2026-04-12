import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { PostHogService } from 'src/posthog/posthog.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class RespondInvestorInvitationHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    invitationId,
    action,
  }: {
    transactionId: string;
    userId: string;
    invitationId: string;
    action: 'accept' | 'decline';
  }) {
    this.logger.info('Responding to investor invitation', {
      transactionId,
      userId,
      invitationId,
      action,
    });

    const result = await this.startupService.respondToInvestorInvitation({
      transactionId,
      userId,
      invitationId,
      action,
    });

    this.posthogService.capture(userId, 'investor_invitation_responded', {
      action,
    });

    return result;
  }
}
