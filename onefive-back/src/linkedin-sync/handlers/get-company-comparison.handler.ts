import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { LinkedInCompanySyncService } from '../linkedin-company-sync.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LinkedInCompany } from '../schemas/linkedin-company.schema';
import { LinkedInSyncNotFoundException } from '../linkedin-sync.exception';

@Injectable()
export class GetCompanyComparisonHandler {
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
    current: any;
    linkedin: any;
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
        'You must be a member of this startup to view comparison data',
      );
    }

    // Récupérer les données actuelles de la startup
    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
      select: {
        name: true,
        tagline: true,
        description: true,
        website: true,
        logo: true,
        coverImage: true,
        countryCode: true,
        city: true,
        foundedDate: true,
        categories: true,
        linkedin: true,
      },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    // Récupérer les données LinkedIn stockées
    const linkedInSync = await this.linkedInCompanySyncService.getByStartupId({
      transactionId,
      startupId,
    });

    if (!linkedInSync) {
      LinkedInSyncNotFoundException.throw(this.logger, {
        transactionId,
        startupId,
        error: 'No LinkedIn data found. Please initiate a sync first.',
        timestamp: new Date().toISOString(),
      });
    }

    const linkedinData = linkedInSync.rawData as LinkedInCompany;

    // Extraire la location principale
    const mainLocation =
      linkedinData.locations?.find((loc) => loc.headquarter) ||
      linkedinData.locations?.[0];

    return {
      current: {
        name: startup.name,
        tagline: startup.tagline,
        description: startup.description,
        website: startup.website,
        logo: startup.logo,
        coverImage: startup.coverImage,
        countryCode: startup.countryCode,
        city: startup.city,
        foundedDate: startup.foundedDate?.toISOString().split('T')[0],
        categories: startup.categories,
        linkedin: startup.linkedin,
      },
      linkedin: {
        name: linkedinData.name,
        tagline: linkedinData.tagline,
        description: linkedinData.description,
        website: linkedinData.website || linkedinData.callToActionUrl,
        logo: linkedinData.logo || linkedinData.logos?.[0]?.url,
        backgroundCover:
          linkedinData.backgroundCover ||
          linkedinData.backgroundCovers?.[0]?.url,
        countryCode: mainLocation?.country || mainLocation?.parsed?.countryCode,
        city: mainLocation?.city || mainLocation?.parsed?.city,
        foundedYear: linkedinData.foundedOn?.year,
        industries:
          linkedinData.industries?.map((i) => i.name).filter(Boolean) || [],
        employeeCount: linkedinData.employeeCount,
        employeeCountRange: linkedinData.employeeCountRange,
        followerCount: linkedinData.followerCount,
        linkedinUrl: linkedinData.linkedinUrl,
      },
    };
  }
}
