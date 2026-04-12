import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class ToggleInvestorVisibilityHandler {
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
    isVisible,
  }: {
    transactionId: string;
    userId: string;
    invitationId: string;
    isVisible: boolean;
  }) {
    this.logger.info('Toggling investor visibility', {
      transactionId,
      userId,
      invitationId,
      isVisible,
    });

    const result = await this.startupService.toggleInvestorVisibility({
      transactionId,
      userId,
      invitationId,
      isVisible,
    });

    this.posthogService.capture(userId, 'investor_visibility_toggled', {});

    return result;
  }
}
