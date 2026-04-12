import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { LinkedInCompanySyncService } from '../linkedin-company-sync.service';
import { ApifyService } from '../apify.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InitiateCompanySyncDto } from '../dto/linkedin-company-sync.dto';
import { LinkedInCompany } from '../schemas/linkedin-company.schema';
import {
  LinkedInSyncNotFoundException,
  LinkedInSyncRateLimitException,
} from '../linkedin-sync.exception';

@Injectable()
export class InitiateCompanySyncHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly linkedInCompanySyncService: LinkedInCompanySyncService,
    private readonly apifyService: ApifyService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    startupId,
    userId,
    dto,
  }: {
    transactionId: string;
    startupId: string;
    userId: string;
    dto: InitiateCompanySyncDto;
  }): Promise<{
    success: boolean;
    message: string;
    linkedinData: LinkedInCompany;
  }> {
    // Vérifier que l'utilisateur est membre de la startup avec les droits
    const membership = await this.prisma.startupMember.findFirst({
      where: {
        startupId,
        profile: { userId },
        role: { in: ['SUPER_ADMIN', 'ADMIN'] },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be an owner or admin of this startup to sync LinkedIn data',
      );
    }

    // Vérifier le rate limit
    const { canSync, hoursRemaining } =
      await this.linkedInCompanySyncService.canSync({
        transactionId,
        startupId,
      });

    if (!canSync) {
      LinkedInSyncRateLimitException.throw(this.logger, {
        transactionId,
        startupId,
        hoursRemaining,
        error: `Rate limit exceeded. Please wait ${hoursRemaining} hours before syncing again.`,
        timestamp: new Date().toISOString(),
      });
    }

    // Scraper le profil LinkedIn de la company
    const linkedinData = await this.apifyService.scrapeLinkedInCompany({
      transactionId,
      linkedinUrl: dto.linkedinUrl,
    });

    // Stocker les données brutes
    await this.linkedInCompanySyncService.upsert({
      transactionId,
      startupId,
      linkedinCompanyId: linkedinData.id,
      linkedinUrl: linkedinData.linkedinUrl || dto.linkedinUrl,
      rawData: linkedinData,
    });

    return {
      success: true,
      message: 'LinkedIn company data retrieved successfully',
      linkedinData,
    };
  }
}
