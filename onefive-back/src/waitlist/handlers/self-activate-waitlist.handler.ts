import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { WaitlistService } from '../waitlist.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';
import { PostHogService } from 'src/posthog/posthog.service';

/**
 * Self-activate the current user's profile from the waitlist.
 * Only available when NODE_ENV=development (enforced in controller).
 */
@Injectable()
export class SelfActivateWaitlistHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly waitlistService: WaitlistService,
    private readonly prisma: PrismaService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    this.logger.info('Self-activating waitlist (dev only)', {
      transactionId,
      userId,
    });

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true, waitlistStatus: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.waitlistStatus === 'ACTIVE') {
      return { message: 'Already activated' };
    }

    await this.waitlistService.activateProfile(profile.id);

    this.logger.info('Waitlist self-activated', {
      transactionId,
      profileId: profile.id,
    });

    this.posthogService.capture(userId, 'waitlist_self_activated', {
      previous_status: profile.waitlistStatus,
    });

    return { message: 'Account activated successfully' };
  }
}
