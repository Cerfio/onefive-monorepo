import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { LinkedInSyncService } from '../linkedin-sync.service';
import { ProfileService } from 'src/profile/profile.service';
import { ExperienceService } from 'src/experience/experience.service';
import { EducationService } from 'src/education/education.service';
import { StorageService } from 'src/storage/storage.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApplySyncFieldsDto } from '../dto/linkedin-sync.dto';
import { LinkedInSyncNotFoundException } from '../linkedin-sync.exception';
import { LinkedInProfile } from '../schemas/linkedin-profile.schema';
import axios from 'axios';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class ApplyLinkedInSyncHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly linkedInSyncService: LinkedInSyncService,
    private readonly profileService: ProfileService,
    private readonly experienceService: ExperienceService,
    private readonly educationService: EducationService,
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    syncFields,
  }: {
    transactionId: string;
    userId: string;
    syncFields: ApplySyncFieldsDto;
  }): Promise<{
    success: boolean;
    message: string;
    updatedFields: string[];
  }> {
    // Récupérer le profil utilisateur
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    // Note: On ne vérifie plus le rate limit ici car il est déjà vérifié lors de l'initiation
    // L'utilisateur peut réappliquer les données d'un précédent sync sans limite de temps

    // Récupérer les données LinkedIn stockées
    const linkedInSync = await this.linkedInSyncService.getByProfileId({
      transactionId,
      profileId: profile.id,
    });

    if (!linkedInSync) {
      LinkedInSyncNotFoundException.throw(this.logger, {
        transactionId,
        profileId: profile.id,
        error: 'No LinkedIn data found. Please initiate a sync first.',
        timestamp: new Date().toISOString(),
      });
    }

    const linkedinData = linkedInSync.rawData as LinkedInProfile;
    const updatedFields: string[] = [];

    this.logger.info('Apply Sync - syncFields received', {
      transactionId,
      syncFields,
    });
    this.logger.debug('Apply Sync - linkedinData images', {
      transactionId,
      photo: linkedinData.photo,
      profilePicture: linkedinData.profilePicture,
      coverPicture: linkedinData.coverPicture,
    });

    // Appliquer les mises à jour dans une transaction
    await this.prisma.$transaction(async (tx) => {
      const profileUpdates: Record<string, any> = {};

      // Sync headline
      if (syncFields.syncHeadline && linkedinData.headline) {
        profileUpdates.highlight = linkedinData.headline;
        updatedFields.push('headline');
      }

      // Sync bio
      if (syncFields.syncBio && linkedinData.about) {
        profileUpdates.bio = linkedinData.about;
        updatedFields.push('bio');
      }

      // Sync skills
      if (syncFields.syncSkills && syncFields.selectedSkills?.length) {
        profileUpdates.skills = syncFields.selectedSkills;
        updatedFields.push('skills');
      }

      // Mettre à jour le profil si des champs ont été modifiés
      if (Object.keys(profileUpdates).length > 0) {
        await tx.profile.update({
          where: { userId },
          data: profileUpdates,
        });
      }

      // Sync avatar
      if (syncFields.syncAvatar) {
        const avatarUrl =
          linkedinData.photo || linkedinData.profilePicture?.url;
        this.logger.info('Sync Avatar - URL', { transactionId, avatarUrl });
        if (avatarUrl) {
          const savedAvatar = await this.downloadAndSaveImage({
            transactionId,
            imageUrl: avatarUrl,
            profileId: profile.id,
            type: 'avatar',
          });
          this.logger.info('Sync Avatar - Saved', {
            transactionId,
            savedAvatar,
          });
          if (savedAvatar) {
            await tx.profile.update({
              where: { userId },
              data: { avatarId: savedAvatar.id },
            });
            updatedFields.push('avatar');
          }
        }
      }

      // Sync cover
      if (syncFields.syncCover) {
        const coverUrl = linkedinData.coverPicture?.url;
        this.logger.info('Sync Cover - URL', { transactionId, coverUrl });
        if (coverUrl) {
          const savedCover = await this.downloadAndSaveImage({
            transactionId,
            imageUrl: coverUrl,
            profileId: profile.id,
            type: 'cover',
          });
          this.logger.info('Sync Cover - Saved', { transactionId, savedCover });
          if (savedCover) {
            await tx.profile.update({
              where: { userId },
              data: { coverId: savedCover.id },
            });
            updatedFields.push('cover');
          }
        }
      }

      // Sync experiences
      if (
        syncFields.syncExperiences &&
        syncFields.selectedExperiences?.length
      ) {
        const existingExperiences = await tx.experience.findMany({
          where: { profile: { userId } },
          select: { id: true, title: true, company: true, from: true },
        });

        for (const exp of syncFields.selectedExperiences) {
          const fromDate = this.parseDate(exp.from);
          if (!fromDate) {
            this.logger.warn(
              'Sync Experiences - skipping entry with invalid from date',
              {
                transactionId,
                title: exp.title,
                company: exp.company,
                from: exp.from,
              },
            );
            continue;
          }

          let savedLogoUrl: string | null = null;
          if (exp.logoUrl) {
            const savedLogo = await this.downloadAndSaveImage({
              transactionId,
              imageUrl: exp.logoUrl,
              profileId: profile.id,
              type: 'logo',
            });
            if (savedLogo) {
              savedLogoUrl = savedLogo.url;
            }
          }

          const existingExp = existingExperiences.find((e) =>
            this.isSameExperience(e, exp),
          );

          if (existingExp) {
            await tx.experience.update({
              where: { id: existingExp.id },
              data: {
                ...(savedLogoUrl ? { logoUrl: savedLogoUrl } : {}),
                city: exp.city,
                to: exp.to ? new Date(exp.to) : null,
                description: exp.description,
                urlLinkedin: exp.urlLinkedin,
                tags: exp.tags || [],
              },
            });
          } else {
            await tx.experience.create({
              data: {
                title: exp.title,
                company: exp.company,
                domain: null,
                logoUrl: savedLogoUrl || null,
                city: exp.city,
                from: fromDate,
                to: exp.to ? this.parseDate(exp.to) : null,
                description: exp.description,
                urlLinkedin: exp.urlLinkedin,
                tags: exp.tags || [],
                profile: { connect: { userId } },
              },
            });
          }
        }
        updatedFields.push('experiences');
      }

      // Sync education
      if (syncFields.syncEducation && syncFields.selectedEducation?.length) {
        const existingEducations = await tx.education.findMany({
          where: { profile: { userId } },
          select: { id: true, school: true, degree: true, from: true },
        });

        for (const edu of syncFields.selectedEducation) {
          const fromDate = this.parseDate(edu.from);
          if (!fromDate) {
            this.logger.warn(
              'Sync Education - skipping entry with invalid from date',
              {
                transactionId,
                degree: edu.degree,
                school: edu.school,
                from: edu.from,
              },
            );
            continue;
          }

          let savedLogoUrl: string | null = null;
          if (edu.logoUrl) {
            const savedLogo = await this.downloadAndSaveImage({
              transactionId,
              imageUrl: edu.logoUrl,
              profileId: profile.id,
              type: 'logo',
            });
            if (savedLogo) {
              savedLogoUrl = savedLogo.url;
            }
          }

          const existingEdu = existingEducations.find((e) =>
            this.isSameEducation(e, edu),
          );

          if (existingEdu) {
            await tx.education.update({
              where: { id: existingEdu.id },
              data: {
                ...(savedLogoUrl ? { logoUrl: savedLogoUrl } : {}),
                city: edu.city,
                to: edu.to ? new Date(edu.to) : null,
                description: edu.description,
                urlLinkedin: edu.urlLinkedin,
                tags: edu.tags || [],
              },
            });
          } else {
            await tx.education.create({
              data: {
                degree: edu.degree,
                school: edu.school,
                domain: null,
                logoUrl: savedLogoUrl || null,
                city: edu.city,
                from: fromDate,
                to: edu.to ? this.parseDate(edu.to) : null,
                description: edu.description,
                urlLinkedin: edu.urlLinkedin,
                tags: edu.tags || [],
                profile: { connect: { userId } },
              },
            });
          }
        }
        updatedFields.push('education');
      }
    });

    // Mettre à jour la date de dernière synchronisation
    await this.linkedInSyncService.updateLastSyncedAt({
      transactionId,
      profileId: profile.id,
    });

    this.posthogService.capture(userId, 'linkedin_sync_applied', {
      fields_synced: updatedFields,
      field_count: updatedFields.length,
    });

    return {
      success: true,
      message: `Successfully synchronized ${updatedFields.length} field(s) from LinkedIn`,
      updatedFields,
    };
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private toYearMonth(date: Date | string | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  private isSameExperience(
    existing: { title: string; company: string; from: Date },
    incoming: { title: string; company: string; from: string },
  ): boolean {
    return (
      this.normalizeText(existing.title) ===
        this.normalizeText(incoming.title) &&
      this.normalizeText(existing.company) ===
        this.normalizeText(incoming.company) &&
      this.toYearMonth(existing.from) === this.toYearMonth(incoming.from)
    );
  }

  private isSameEducation(
    existing: { school: string; degree: string; from: Date },
    incoming: { school: string; degree: string; from: string },
  ): boolean {
    return (
      this.normalizeText(existing.school) ===
        this.normalizeText(incoming.school) &&
      this.normalizeText(existing.degree) ===
        this.normalizeText(incoming.degree) &&
      this.toYearMonth(existing.from) === this.toYearMonth(incoming.from)
    );
  }

  private async downloadAndSaveImage({
    transactionId,
    imageUrl,
    profileId,
    type,
  }: {
    transactionId: string;
    imageUrl: string;
    profileId: string;
    type: 'avatar' | 'cover' | 'logo';
  }): Promise<{ id: string; url: string } | null> {
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
      const fileName = `linkedin-${type}-${profileId}-${Date.now()}.${extension}`;
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
      const file = await this.prisma.file.create({
        data: {
          id: uploadResult.id,
          size: buffer.length,
          mimeType: contentType,
          bucket: bucketName,
          url: uploadResult.url,
        },
      });

      return { id: file.id, url: uploadResult.url };
    } catch (error) {
      this.logger.error('Failed to download and save LinkedIn image', {
        transactionId,
        imageUrl,
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }
}
