import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';
import { CreateFundingHistoryDto } from '../dto/funding-history.dto';
import { StartupUpdateException } from '../startup.exception';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { EmailService } from '../../email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class CreateFundingHistoryHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
    private readonly notificationHelper: NotificationHelperService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly posthogService: PostHogService,
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
    data: CreateFundingHistoryDto;
  }) {
    this.logger.info('Creating funding history entry', {
      transactionId,
      userId,
      startupId,
    });

    try {
      const historyEntry = await this.startupService.createFundingHistory({
        transactionId,
        startupId,
        userId,
        data,
      });

      this.logger.info('Funding history entry created successfully', {
        transactionId,
        startupId,
        userId,
      });

      // Get inviter profile for notifications
      const inviterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true, firstName: true, lastName: true },
      });

      const startupName = historyEntry.startupName || 'une startup';
      const inviterName = inviterProfile
        ? `${inviterProfile.firstName} ${inviterProfile.lastName}`
        : "Quelqu'un";

      // Send notifications to OneFive profile investors
      if (historyEntry._newProfileInvestors?.length > 0) {
        for (const inv of historyEntry._newProfileInvestors) {
          try {
            await this.notificationHelper.notifyInvestorInvitation({
              invitedProfileId: inv.profileId,
              inviterProfileId: inviterProfile?.id || '',
              inviterName,
              startupId,
              startupName,
              investorRecordId: inv.investorRecordId,
            });
          } catch (err) {
            this.logger.error('Failed to send investor notification', {
              transactionId,
              profileId: inv.profileId,
              error: err instanceof Error ? err.message : 'Unknown',
            });
          }
        }
      }

      // Send email invitations to manual person investors
      if (historyEntry._newManualPersonInvestors?.length > 0) {
        const frontendUrl =
          this.configService.get<string>('FRONTEND_URL') ||
          'https://app.onefive.com';

        for (const inv of historyEntry._newManualPersonInvestors) {
          try {
            const acceptUrl = `${frontendUrl}/invitation/investor/${inv.token}`;
            await this.emailService.sendEmail({
              to: inv.email,
              type: 'investor-invitation',
              payload: {
                inviterName,
                startupName,
                firstName: inv.firstName,
                lastName: inv.lastName,
                acceptUrl,
              },
            });
          } catch (err) {
            this.logger.error('Failed to send investor invitation email', {
              transactionId,
              email: inv.email,
              error: err instanceof Error ? err.message : 'Unknown',
            });
          }
        }
      }

      // Strip internal fields before returning to client
      const {
        _newProfileInvestors,
        _newManualPersonInvestors,
        startupName: _sn,
        ...result
      } = historyEntry;

      this.posthogService.capture(userId, 'funding_history_created', {
        startup_id: startupId,
      });

      return result;
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
