import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { LinkedinService } from 'src/linkedin/linkedin.service';
import { ApifyService } from '../apify.service';
import { LinkedInSyncService } from '../linkedin-sync.service';
import { ProfileService } from 'src/profile/profile.service';
import { LinkedInSyncRateLimitException } from '../linkedin-sync.exception';
import {
  LinkedInComparisonData,
  ManualUrlRequiredResult,
} from '../dto/linkedin-sync.dto';
import { LinkedInProfile } from '../schemas/linkedin-profile.schema';

@Injectable()
export class OAuthLinkedInSyncHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly linkedinService: LinkedinService,
    private readonly apifyService: ApifyService,
    private readonly linkedInSyncService: LinkedInSyncService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    code,
  }: {
    transactionId: string;
    userId: string;
    code: string;
  }): Promise<LinkedInComparisonData | ManualUrlRequiredResult> {
    this.logger.info('OAuth LinkedIn Sync Handler - Starting', {
      transactionId,
      userId,
    });

    this.logger.info('Starting OAuth LinkedIn sync', { transactionId, userId });

    // 1. Échanger le code contre un access token
    const accessTokenData = await this.linkedinService.getAccessToken({
      transactionId,
      data: { code },
    });

    // 2. Récupérer les infos utilisateur LinkedIn (incluant vanityName)
    this.logger.info('Retrieving LinkedIn user info', { transactionId });
    const userInfo = await this.linkedinService.getUserInfo({
      transactionId,
      accessToken: accessTokenData.access_token,
    });

    this.logger.info('LinkedIn UserInfo received', {
      transactionId,
      sub: userInfo.sub,
      email: userInfo.email,
      vanityName: userInfo.vanityName,
      hasLinkedinUrl: !!userInfo.linkedinUrl,
    });

    // 3. Vérifier qu'on a bien l'URL LinkedIn
    const linkedinUrl = userInfo.linkedinUrl;
    if (!linkedinUrl) {
      this.logger.info(
        'LinkedIn URL not available from OAuth, manual input required',
        {
          transactionId,
          vanityName: userInfo.vanityName,
        },
      );

      return {
        requiresManualUrl: true,
        userInfo: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
      };
    }

    this.logger.info('LinkedIn URL retrieved', { transactionId, linkedinUrl });

    this.logger.info('LinkedIn URL retrieved via OAuth', {
      transactionId,
      linkedinUrl,
    });

    // 4. Récupérer le profil utilisateur
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: {
        id: true,
        linkedinUrl: true,
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

    // 5. Mettre à jour l'URL LinkedIn dans le profil si elle n'existe pas
    if (!(profile as any).linkedinUrl) {
      await this.profileService.update({
        transactionId,
        where: { id: profile.id },
        data: { linkedinUrl } as any,
      });
    }

    // 6. Vérifier si l'utilisateur peut synchroniser (limite 24h)
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

    // 7. Scraper le profil LinkedIn via Apify
    const linkedinData = await this.apifyService.scrapeLinkedInProfile({
      transactionId,
      linkedinUrl,
    });

    // 8. Stocker les données brutes
    await this.linkedInSyncService.upsert({
      transactionId,
      profileId: profile.id,
      linkedinPublicId: linkedinData.publicIdentifier || undefined,
      linkedinUrl: linkedinData.linkedinUrl || linkedinUrl,
      rawData: linkedinData,
    });

    // 9. Transformer les données pour la comparaison
    return this.buildComparisonData(profile, linkedinData, syncStatus);
  }

  private buildComparisonData(
    profile: any,
    linkedinData: LinkedInProfile,
    syncStatus: {
      canSync: boolean;
      nextSyncAvailableAt?: Date;
      hoursRemaining?: number;
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
