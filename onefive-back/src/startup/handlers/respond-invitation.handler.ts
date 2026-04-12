import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class RespondStartupInvitationHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
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

    return {
      id: invitation.id,
      status: invitation.status,
      respondedAt: invitation.respondedAt?.toISOString(),
    };
  }
}
