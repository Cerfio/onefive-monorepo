import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { ApifyService } from '../apify.service';
import { LinkedInSyncService } from '../linkedin-sync.service';
import { ProfileService } from 'src/profile/profile.service';
import {
  LinkedInSyncRateLimitException,
  LinkedInSyncInvalidUrlException,
} from '../linkedin-sync.exception';
import { LinkedInComparisonData } from '../dto/linkedin-sync.dto';
import { LinkedInProfile } from '../schemas/linkedin-profile.schema';
import { StorageService } from 'src/storage/storage.service';

@Injectable()
export class InitiateLinkedInSyncHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly apifyService: ApifyService,
    private readonly linkedInSyncService: LinkedInSyncService,
    private readonly profileService: ProfileService,
    private readonly storageService: StorageService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    linkedinUrl,
  }: {
    transactionId: string;
    userId: string;
    linkedinUrl?: string; // Rendre optionnel
  }): Promise<LinkedInComparisonData> {
    // Récupérer le profil utilisateur
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: {
        id: true,
        linkedinUrl: true, // Récupérer l'URL stockée
        highlight: true,
        bio: true,
        avatarId: true,
        coverId: true,
        skills: true,
        avatar: { select: { id: true } },
        cover: { select: { id: true } },
        experiences: {
          select: {
            id: true,
            title: true,
            company: true,
            city: true,
            from: true,
            to: true,
            description: true,
            urlLinkedin: true,
            tags: true,
          },
          orderBy: { from: 'desc' },
        },
        educations: {
          select: {
            id: true,
            degree: true,
            school: true,
            city: true,
            from: true,
            to: true,
            description: true,
            urlLinkedin: true,
            tags: true,
          },
          orderBy: { from: 'desc' },
        },
      } as any, // Cast temporaire car Prisma Client n'a pas encore le type linkedinUrl
    });

    // Si l'URL n'est pas fournie, utiliser celle stockée dans le profil
    const finalLinkedinUrl = linkedinUrl || (profile as any).linkedinUrl;

    this.logger.info('Initiate LinkedIn Sync - URL verification', {
      transactionId,
      linkedinUrl,
      profileLinkedinUrl: (profile as any).linkedinUrl,
      finalLinkedinUrl,
    });

    if (!finalLinkedinUrl) {
      this.logger.error('No LinkedIn URL provided or stored', {
        transactionId,
        linkedinUrl,
        profileLinkedinUrl: (profile as any).linkedinUrl,
      });

      LinkedInSyncInvalidUrlException.throw(this.logger, {
        transactionId,
        linkedinUrl: 'No LinkedIn URL provided or stored',
        error:
          'LinkedIn URL is required. Please provide one or authenticate with LinkedIn.',
        timestamp: new Date().toISOString(),
      });
    }

    // Valider l'URL LinkedIn
    const isValid = this.isValidLinkedInUrl(finalLinkedinUrl);
    this.logger.info('LinkedIn URL validation result', {
      transactionId,
      isValid,
      finalLinkedinUrl,
    });

    if (!isValid) {
      this.logger.error('Invalid LinkedIn URL', {
        transactionId,
        url: finalLinkedinUrl,
      });

      LinkedInSyncInvalidUrlException.throw(this.logger, {
        transactionId,
        linkedinUrl: finalLinkedinUrl,
        error: 'Invalid LinkedIn profile URL',
        timestamp: new Date().toISOString(),
      });
    }

    // Vérifier si l'utilisateur peut synchroniser (limite 24h)
    const syncStatus = await this.linkedInSyncService.canSync({
      transactionId,
      profileId: profile.id,
    });

    if (!syncStatus.canSync) {
      LinkedInSyncRateLimitException.throw(this.logger, {
        transactionId,
        profileId: profile.id,
        nextSyncAvailableAt: syncStatus.nextSyncAvailableAt,
        hoursRemaining: syncStatus.hoursRemaining,
        error: `Synchronization is limited to once every 24 hours. Next sync available in ${syncStatus.hoursRemaining} hours.`,
        timestamp: new Date().toISOString(),
      });
    }

    // Scraper le profil LinkedIn via Apify
    const linkedinData = await this.apifyService.scrapeLinkedInProfile({
      transactionId,
      linkedinUrl: finalLinkedinUrl,
    });

    // Stocker les données brutes
    await this.linkedInSyncService.upsert({
      transactionId,
      profileId: profile.id,
      linkedinPublicId: linkedinData.publicIdentifier || undefined,
      linkedinUrl: linkedinData.linkedinUrl || finalLinkedinUrl,
      rawData: linkedinData,
    });

    // Si l'URL n'était pas stockée dans le profil, la mettre à jour
    if (!(profile as any).linkedinUrl && linkedinUrl) {
      await this.profileService.update({
        transactionId,
        where: { id: profile.id },
        data: { linkedinUrl: finalLinkedinUrl } as any,
      });
    }

    // Transformer les données pour la comparaison
    return this.buildComparisonData(profile, linkedinData, syncStatus);
  }

  private isValidLinkedInUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return (
        (parsedUrl.hostname === 'www.linkedin.com' ||
          parsedUrl.hostname === 'linkedin.com') &&
        parsedUrl.pathname.startsWith('/in/')
      );
    } catch {
      return false;
    }
  }

  private buildComparisonData(
    profile: any,
    linkedinData: LinkedInProfile,
    syncStatus: {
      canSync: boolean;
      nextSyncAvailableAt?: Date;
      hoursRemaining?: number;
      syncCount?: number;
      syncLimit?: number;
      periodResetsAt?: Date;
    },
  ): LinkedInComparisonData {
    // Transformer les expériences LinkedIn
    const linkedinExperiences = (linkedinData.experience || []).map((exp) => ({
      title: exp.position || '',
      company: exp.companyName || '',
      city: exp.location || linkedinData.location?.parsed?.city || '',
      from: this.parseLinkedInDate(exp.startDate),
      to:
        exp.endDate?.text === 'Present'
          ? undefined
          : this.parseLinkedInDate(exp.endDate),
      description: exp.description || undefined,
      urlLinkedin: exp.companyLinkedinUrl || undefined,
      logoUrl: exp.companyLogo?.url || undefined,
      tags: exp.skills || [],
    }));

    // Transformer les éducations LinkedIn
    const linkedinEducation = (linkedinData.education || []).map((edu) => ({
      degree: edu.degree || '',
      school: edu.schoolName || '',
      city: linkedinData.location?.parsed?.city || '',
      from: this.parseLinkedInDate(edu.startDate),
      to: this.parseLinkedInDate(edu.endDate),
      description: edu.fieldOfStudy || undefined,
      urlLinkedin: edu.schoolLinkedinUrl || undefined,
      logoUrl: edu.schoolLogo?.url || undefined,
      tags: edu.skills || [],
    }));

    // Extraire les skills LinkedIn
    const linkedinSkills = (linkedinData.skills || []).map(
      (skill) => skill.name,
    );

    // Transformer les expériences actuelles
    const currentExperiences = (profile.experiences || []).map((exp: any) => ({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      city: exp.city,
      from: exp.from?.toISOString() || '',
      to: exp.to?.toISOString() || undefined,
      description: exp.description || undefined,
      urlLinkedin: exp.urlLinkedin || undefined,
      logoUrl: exp.logoUrl || undefined,
      tags: exp.tags || [],
    }));

    // Transformer les éducations actuelles
    const currentEducation = (profile.educations || []).map((edu: any) => ({
      id: edu.id,
      degree: edu.degree,
      school: edu.school,
      city: edu.city,
      from: edu.from?.toISOString() || '',
      to: edu.to?.toISOString() || undefined,
      description: edu.description || undefined,
      urlLinkedin: edu.urlLinkedin || undefined,
      logoUrl: edu.logoUrl || undefined,
      tags: edu.tags || [],
    }));

    return {
      linkedin: {
        headline: linkedinData.headline,
        avatarUrl: linkedinData.photo || linkedinData.profilePicture?.url,
        coverUrl: linkedinData.coverPicture?.url,
        bio: linkedinData.about,
        linkedinUrl: linkedinData.linkedinUrl,
        experiences: linkedinExperiences,
        education: linkedinEducation,
        skills: linkedinSkills,
      },
      current: {
        headline: profile.highlight,
        avatarUrl: null,
        coverUrl: null,
        bio: profile.bio,
        experiences: currentExperiences,
        education: currentEducation,
        skills: profile.skills || [],
      },
      canSync: syncStatus.canSync,
      nextSyncAvailableAt: syncStatus.nextSyncAvailableAt,
      hoursRemaining: syncStatus.hoursRemaining,
      syncCount: syncStatus.syncCount,
      syncLimit: syncStatus.syncLimit,
      periodResetsAt: syncStatus.periodResetsAt,
    };
  }

  private parseLinkedInDate(date: any): string {
    if (!date) return '';

    const year = date.year;
    const month =
      typeof date.month === 'number'
        ? date.month
        : this.parseMonthName(date.month);

    if (!year) return '';

    // Retourner une date ISO formatée
    const monthNum = month ? String(month).padStart(2, '0') : '01';
    return `${year}-${monthNum}-01T00:00:00.000Z`;
  }

  private parseMonthName(monthName: string | null | undefined): number | null {
    if (!monthName) return null;

    const months: Record<string, number> = {
      Jan: 1,
      Feb: 2,
      Mar: 3,
      Apr: 4,
      May: 5,
      Jun: 6,
      Jul: 7,
      Aug: 8,
      Sep: 9,
      Oct: 10,
      Nov: 11,
      Dec: 12,
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };

    return months[monthName] || null;
  }
}
