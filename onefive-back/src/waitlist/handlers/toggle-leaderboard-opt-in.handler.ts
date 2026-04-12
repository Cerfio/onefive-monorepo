import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { WaitlistService } from '../waitlist.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class ToggleLeaderboardOptInHandler {
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
    this.logger.info('Toggling leaderboard opt-in', { transactionId, userId });

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const showInLeaderboard = await this.waitlistService.toggleLeaderboardOptIn(
      profile.id,
    );

    this.logger.info('Leaderboard opt-in toggled', {
      transactionId,
      profileId: profile.id,
      showInLeaderboard,
    });

    this.posthogService.capture(userId, 'leaderboard_opt_in_toggled', {
      show_in_leaderboard: showInLeaderboard,
    });

    return { showInLeaderboard };
  }
}
