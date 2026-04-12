import { Inject, Injectable } from '@nestjs/common';
import { Prisma, LinkedInCompanySync } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import {
  LinkedInSyncCreateException,
  LinkedInSyncUpdateException,
  LinkedInSyncGetException,
} from './linkedin-sync.exception';

@Injectable()
export class LinkedInCompanySyncService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async upsert({
    transactionId,
    startupId,
    linkedinCompanyId,
    linkedinUrl,
    rawData,
  }: {
    transactionId: string;
    startupId: string;
    linkedinCompanyId?: string;
    linkedinUrl?: string;
    rawData: object;
  }): Promise<LinkedInCompanySync> {
    try {
      return await this.prisma.linkedInCompanySync.upsert({
        where: { startupId },
        create: {
          startupId,
          linkedinCompanyId,
          linkedinUrl,
          rawData: rawData as Prisma.InputJsonValue,
          lastSyncedAt: new Date(),
        },
        update: {
          linkedinCompanyId,
          linkedinUrl,
          rawData: rawData as Prisma.InputJsonValue,
          lastSyncedAt: new Date(),
        },
      });
    } catch (error: unknown) {
      LinkedInSyncCreateException.throw(this.logger, {
        transactionId,
        startupId,
        error,
      });
    }
  }

  @Log()
  async getByStartupId({
    transactionId,
    startupId,
  }: {
    transactionId: string;
    startupId: string;
  }): Promise<LinkedInCompanySync | null> {
    try {
      return await this.prisma.linkedInCompanySync.findUnique({
        where: { startupId },
      });
    } catch (error: unknown) {
      LinkedInSyncGetException.throw(this.logger, {
        transactionId,
        startupId,
        error,
      });
    }
  }

  @Log()
  async canSync({
    transactionId,
    startupId,
  }: {
    transactionId: string;
    startupId: string;
  }): Promise<{
    canSync: boolean;
    nextSyncAvailableAt?: Date;
    hoursRemaining?: number;
  }> {
    // En développement, on ignore la limite de temps pour faciliter les tests
    if (process.env.NODE_ENV === 'development') {
      return { canSync: true };
    }

    try {
      const existingSync = await this.prisma.linkedInCompanySync.findUnique({
        where: { startupId },
        select: { lastSyncedAt: true },
      });

      if (!existingSync) {
        return { canSync: true };
      }

      const hoursSinceLastSync =
        (Date.now() - existingSync.lastSyncedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSync >= 24) {
        return { canSync: true };
      }

      const nextSyncAvailableAt = new Date(
        existingSync.lastSyncedAt.getTime() + 24 * 60 * 60 * 1000,
      );
      const hoursRemaining = Math.ceil(24 - hoursSinceLastSync);

      return {
        canSync: false,
        nextSyncAvailableAt,
        hoursRemaining,
      };
    } catch (error: unknown) {
      LinkedInSyncGetException.throw(this.logger, {
        transactionId,
        startupId,
        error,
      });
    }
  }

  @Log()
  async updateLastSyncedAt({
    transactionId,
    startupId,
  }: {
    transactionId: string;
    startupId: string;
  }): Promise<LinkedInCompanySync> {
    try {
      return await this.prisma.linkedInCompanySync.update({
        where: { startupId },
        data: { lastSyncedAt: new Date() },
      });
    } catch (error: unknown) {
      LinkedInSyncUpdateException.throw(this.logger, {
        transactionId,
        startupId,
        error,
      });
    }
  }
}
