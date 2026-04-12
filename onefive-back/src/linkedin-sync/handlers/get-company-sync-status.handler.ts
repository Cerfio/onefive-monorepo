import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { LinkedInCompanySyncService } from '../linkedin-company-sync.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GetCompanySyncStatusHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly linkedInCompanySyncService: LinkedInCompanySyncService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    startupId,
    userId,
  }: {
    transactionId: string;
    startupId: string;
    userId: string;
  }): Promise<{
    canSync: boolean;
    hasPreviousSync: boolean;
    nextSyncAvailableAt?: Date;
    hoursRemaining?: number;
    lastSyncedAt?: Date;
  }> {
    // Vérifier que l'utilisateur est membre de la startup
    const membership = await this.prisma.startupMember.findFirst({
      where: {
        startupId,
        profile: { userId },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this startup to check sync status',
      );
    }

    // Vérifier le rate limit
    const { canSync, nextSyncAvailableAt, hoursRemaining } =
      await this.linkedInCompanySyncService.canSync({
        transactionId,
        startupId,
      });

    // Vérifier s'il y a un sync précédent
    const existingSync = await this.linkedInCompanySyncService.getByStartupId({
      transactionId,
      startupId,
    });

    return {
      canSync,
      hasPreviousSync: !!existingSync,
      nextSyncAvailableAt,
      hoursRemaining,
      lastSyncedAt: existingSync?.lastSyncedAt,
    };
  }
}
