import { Inject, Injectable } from '@nestjs/common';
import { Prisma, LinkedInSync } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import {
  LinkedInSyncCreateException,
  LinkedInSyncUpdateException,
  LinkedInSyncGetException,
} from './linkedin-sync.exception';

const SYNC_LIMIT_PER_PERIOD = 5;
const PERIOD_DAYS = 90; // ~3 mois

@Injectable()
export class LinkedInSyncService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async upsert({
    transactionId,
    profileId,
    linkedinPublicId,
    linkedinUrl,
    rawData,
  }: {
    transactionId: string;
    profileId: string;
    linkedinPublicId?: string;
    linkedinUrl?: string;
    rawData: object;
  }): Promise<LinkedInSync> {
    try {
      const existing = await this.prisma.linkedInSync.findUnique({
        where: { profileId },
        select: { syncCount: true, syncPeriodStart: true },
      });

      const now = new Date();
      const periodDurationMs = PERIOD_DAYS * 24 * 60 * 60 * 1000;
      const periodExpired =
        existing &&
        Date.now() - existing.syncPeriodStart.getTime() >= periodDurationMs;

      const newSyncCount =
        !existing || periodExpired ? 1 : (existing.syncCount ?? 0) + 1;

      const newPeriodStart =
        !existing || periodExpired ? now : existing.syncPeriodStart;

      return await this.prisma.linkedInSync.upsert({
        where: { profileId },
        create: {
          profileId,
          linkedinPublicId,
          linkedinUrl,
          rawData: rawData as Prisma.InputJsonValue,
          lastSyncedAt: now,
          syncCount: 1,
          syncPeriodStart: now,
        },
        update: {
          linkedinPublicId,
          linkedinUrl,
          rawData: rawData as Prisma.InputJsonValue,
          lastSyncedAt: now,
          syncCount: newSyncCount,
          syncPeriodStart: newPeriodStart,
        },
      });
    } catch (error: unknown) {
      LinkedInSyncCreateException.throw(this.logger, {
        transactionId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async getByProfileId({
    transactionId,
    profileId,
  }: {
    transactionId: string;
    profileId: string;
  }): Promise<LinkedInSync | null> {
    try {
      return await this.prisma.linkedInSync.findUnique({
        where: { profileId },
      });
    } catch (error: unknown) {
      LinkedInSyncGetException.throw(this.logger, {
        transactionId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async canSync({
    transactionId,
    profileId,
  }: {
    transactionId: string;
    profileId: string;
  }): Promise<{
    canSync: boolean;
    nextSyncAvailableAt?: Date;
    hoursRemaining?: number;
    syncCount?: number;
    syncLimit?: number;
    periodResetsAt?: Date;
  }> {
    // En développement, on ignore la limite de temps pour faciliter les tests
    if (process.env.NODE_ENV === 'development') {
      return { canSync: true, syncCount: 0, syncLimit: SYNC_LIMIT_PER_PERIOD };
    }

    try {
      const existingSync = await this.prisma.linkedInSync.findUnique({
        where: { profileId },
        select: { lastSyncedAt: true, syncCount: true, syncPeriodStart: true },
      });

      if (!existingSync) {
        return {
          canSync: true,
          syncCount: 0,
          syncLimit: SYNC_LIMIT_PER_PERIOD,
        };
      }

      // Vérifier si la période de 3 mois est expirée (reset du compteur)
      const periodStartMs = existingSync.syncPeriodStart.getTime();
      const periodDurationMs = PERIOD_DAYS * 24 * 60 * 60 * 1000;
      const periodExpired = Date.now() - periodStartMs >= periodDurationMs;

      if (periodExpired) {
        return {
          canSync: true,
          syncCount: 0,
          syncLimit: SYNC_LIMIT_PER_PERIOD,
        };
      }

      // Vérifier la limite de syncs dans la période courante
      const currentCount = existingSync.syncCount ?? 0;
      if (currentCount >= SYNC_LIMIT_PER_PERIOD) {
        const periodResetsAt = new Date(periodStartMs + periodDurationMs);
        return {
          canSync: false,
          syncCount: currentCount,
          syncLimit: SYNC_LIMIT_PER_PERIOD,
          periodResetsAt,
        };
      }

      // Vérifier la limite de 24h entre deux syncs consécutifs
      const hoursSinceLastSync =
        (Date.now() - existingSync.lastSyncedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSync < 24) {
        const nextSyncAvailableAt = new Date(
          existingSync.lastSyncedAt.getTime() + 24 * 60 * 60 * 1000,
        );
        const hoursRemaining = Math.ceil(24 - hoursSinceLastSync);

        return {
          canSync: false,
          nextSyncAvailableAt,
          hoursRemaining,
          syncCount: currentCount,
          syncLimit: SYNC_LIMIT_PER_PERIOD,
        };
      }

      return {
        canSync: true,
        syncCount: currentCount,
        syncLimit: SYNC_LIMIT_PER_PERIOD,
      };
    } catch (error: unknown) {
      LinkedInSyncGetException.throw(this.logger, {
        transactionId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async updateLastSyncedAt({
    transactionId,
    profileId,
  }: {
    transactionId: string;
    profileId: string;
  }): Promise<LinkedInSync> {
    try {
      return await this.prisma.linkedInSync.update({
        where: { profileId },
        data: { lastSyncedAt: new Date() },
      });
    } catch (error: unknown) {
      LinkedInSyncUpdateException.throw(this.logger, {
        transactionId,
        profileId,
        error,
      });
    }
  }
}
