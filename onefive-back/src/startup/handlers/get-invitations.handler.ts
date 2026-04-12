import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetStartupInvitationsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    this.logger.info('Getting startup invitations', {
      transactionId,
      userId,
    });

    const invitations = await this.startupService.getStartupInvitations(userId);

    this.logger.info('Startup invitations retrieved', {
      transactionId,
      userId,
      count: invitations.length,
    });

    return invitations.map((invitation) => ({
      id: invitation.id,
      startupId: invitation.startupId,
      startupName: invitation.startup.name,
      startupDescription: invitation.startup.description,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      position: invitation.position,
      equity: invitation.equity,
      message: invitation.message,
      invitedBy: {
        id: invitation.invitedBy.id,
        name: `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`,
      },
      invitedProfile: invitation.invitedProfile
        ? {
            id: invitation.invitedProfile.id,
            name: `${invitation.invitedProfile.firstName} ${invitation.invitedProfile.lastName}`,
            avatar: invitation.invitedProfile.avatar,
          }
        : undefined,
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      createdAt: invitation.createdAt.toISOString(),
    }));
  }
}
