import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { LinkedInCompanySyncService } from '../linkedin-company-sync.service';
import { StorageService } from 'src/storage/storage.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApplyCompanySyncFieldsDto } from '../dto/linkedin-company-sync.dto';
import { LinkedInCompany } from '../schemas/linkedin-company.schema';
import { LinkedInSyncNotFoundException } from '../linkedin-sync.exception';
import axios from 'axios';

@Injectable()
export class ApplyCompanySyncHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly linkedInCompanySyncService: LinkedInCompanySyncService,
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Log()
  async execute({
    transactionId,
    startupId,
    userId,
    syncFields,
  }: {
    transactionId: string;
    startupId: string;
    userId: string;
    syncFields: ApplyCompanySyncFieldsDto;
  }): Promise<{
    success: boolean;
    message: string;
    updatedFields: string[];
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
        'You must be an owner or admin of this startup to apply LinkedIn sync',
      );
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
    const updatedFields: string[] = [];
    const updates: Record<string, any> = {};

    // Sync name
    if (syncFields.syncName && linkedinData.name) {
      updates.name = linkedinData.name;
      updatedFields.push('name');
    }

    // Sync tagline
    if (syncFields.syncTagline && linkedinData.tagline) {
      updates.tagline = linkedinData.tagline;
      updatedFields.push('tagline');
    }

    // Sync description (description LinkedIn -> description startup pour À propos)
    if (syncFields.syncDescription && linkedinData.description) {
      updates.description = linkedinData.description;
      updatedFields.push('description');
    }

    // Sync website
    if (syncFields.syncWebsite) {
      const website = linkedinData.website || linkedinData.callToActionUrl;
      if (website) {
        updates.website = website;
        updatedFields.push('website');
      }
    }

    // Sync location
    if (syncFields.syncLocation) {
      const mainLocation =
        linkedinData.locations?.find((loc) => loc.headquarter) ||
        linkedinData.locations?.[0];
      if (mainLocation) {
        const countryCode =
          mainLocation.country || mainLocation.parsed?.countryCode;
        const city = mainLocation.city || mainLocation.parsed?.city;
        if (countryCode) {
          updates.countryCode = countryCode;
          updatedFields.push('countryCode');
        }
        if (city) {
          updates.city = city;
          updatedFields.push('city');
        }
      }
    }

    // Sync founded date
    if (syncFields.syncFoundedDate && linkedinData.foundedOn?.year) {
      updates.foundedDate = new Date(linkedinData.foundedOn.year, 0, 1);
      updatedFields.push('foundedDate');
    }

    // Sync industries as categories
    if (syncFields.syncIndustries && linkedinData.industries?.length) {
      const industries = linkedinData.industries
        .map((i) => i.name)
        .filter(Boolean) as string[];
      if (industries.length > 0) {
        updates.categories = industries;
        updatedFields.push('categories');
      }
    }

    // Sync LinkedIn URL
    if (linkedinData.linkedinUrl) {
      updates.linkedin = linkedinData.linkedinUrl;
    }

    // Sync logo
    if (syncFields.syncLogo) {
      const logoUrl = linkedinData.logo || linkedinData.logos?.[0]?.url;
      if (logoUrl) {
        const savedLogo = await this.downloadAndSaveImage({
          transactionId,
          imageUrl: logoUrl,
          startupId,
          type: 'logo',
        });
        if (savedLogo) {
          updates.logo = savedLogo.url;
          updatedFields.push('logo');
        }
      }
    }

    // Sync cover
    if (syncFields.syncCover) {
      const coverUrl =
        linkedinData.backgroundCover || linkedinData.backgroundCovers?.[0]?.url;
      if (coverUrl) {
        const savedCover = await this.downloadAndSaveImage({
          transactionId,
          imageUrl: coverUrl,
          startupId,
          type: 'cover',
        });
        if (savedCover) {
          updates.coverImage = savedCover.url;
          updatedFields.push('coverImage');
        }
      }
    }

    // Appliquer les mises à jour
    if (Object.keys(updates).length > 0) {
      await this.prisma.startup.update({
        where: { id: startupId },
        data: updates,
      });
    }

    // Mettre à jour la date de dernière synchronisation
    await this.linkedInCompanySyncService.updateLastSyncedAt({
      transactionId,
      startupId,
    });

    return {
      success: true,
      message: `Successfully synchronized ${updatedFields.length} field(s) from LinkedIn`,
      updatedFields,
    };
  }

  private async downloadAndSaveImage({
    transactionId,
    imageUrl,
    startupId,
    type,
  }: {
    transactionId: string;
    imageUrl: string;
    startupId: string;
    type: 'logo' | 'cover';
  }): Promise<{ url: string } | null> {
    try {
      // Télécharger l'image avec des headers de navigateur pour éviter le blocage LinkedIn
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
          Referer: 'https://www.linkedin.com/',
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'cross-site',
        },
      });

      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || 'image/jpeg';
      const extension = contentType.split('/')[1] || 'jpg';
      const fileName = `linkedin-company-${type}-${startupId}-${Date.now()}.${extension}`;
      const bucketName = process.env.S3_BUCKET_NAME || 'onefive-storage';

      // Sauvegarder via le storage service
      const uploadResult = await this.storageService.uploadFile({
        transactionId,
        data: {
          buffer,
          filename: fileName,
          mimeType: contentType,
          bucketName,
        },
      });

      // Créer l'entrée dans la table File
      await this.prisma.file.create({
        data: {
          id: uploadResult.id,
          size: buffer.length,
          mimeType: contentType,
          bucket: bucketName,
          url: uploadResult.url,
        },
      });

      return { url: uploadResult.url };
    } catch (error) {
      this.logger.error('Failed to download and save LinkedIn company image', {
        transactionId,
        imageUrl,
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }
}
