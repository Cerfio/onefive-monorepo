import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../../startup/startup.service';
import { Log } from '../../common/logger/logger.decorator';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class RespondStartupInvitationHandler {
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
    this.logger.info('Responding to startup invitation', {
      transactionId,
      userId,
      invitationId,
      action,
    });

    const invitation = await this.startupService.respondToInvitation({
      transactionId,
      invitationId,
      userId,
      action,
    });

    this.logger.info('Startup invitation response processed', {
      transactionId,
      userId,
      invitationId,
      action,
      newStatus: invitation.status,
    });

    this.posthogService.capture(userId, 'startup_invitation_responded', {
      action,
    });

    return {
      id: invitation.id,
      status: invitation.status,
      respondedAt: invitation.respondedAt?.toISOString(),
    };
  }
}
