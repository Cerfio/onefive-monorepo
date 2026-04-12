import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { ReferralService } from '../referral.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class ListMyReferralsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly referralService: ReferralService,
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
    this.logger.info('Listing user referrals', {
      transactionId,
      userId,
    });

    // Récupérer le profile de l'utilisateur
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const referrals = await this.referralService.getMyReferrals(profile.id);

    this.logger.info('User referrals retrieved', {
      transactionId,
      profileId: profile.id,
      count: referrals.length,
    });

    return referrals;
  }
}
