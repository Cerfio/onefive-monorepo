import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { WaitlistService } from '../waitlist.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetWaitlistStatusHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly waitlistService: WaitlistService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    this.logger.info('Getting waitlist status', { transactionId, userId });

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const status = await this.waitlistService.getWaitlistStatus(profile.id);

    this.logger.info('Waitlist status retrieved', {
      transactionId,
      profileId: profile.id,
      status: status.status,
    });

    return status;
  }
}
