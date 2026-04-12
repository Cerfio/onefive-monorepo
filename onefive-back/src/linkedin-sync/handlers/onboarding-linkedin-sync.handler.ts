import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { LinkedinService } from '../../linkedin/linkedin.service';
import { ApifyService } from '../apify.service';
import { ManualUrlRequiredResult } from '../dto/linkedin-sync.dto';

export interface OnboardingLinkedInData {
  profile: {
    firstName: string;
    lastName: string;
    headline?: string;
    location?: string;
    countryCode?: string;
    city?: string;
    profilePictureUrl?: string;
  };
  experiences: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
    location?: string;
  }>;
  educations: Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
  }>;
  skills: string[];
}

@Injectable()
export class OnboardingLinkedInSyncHandler {
  constructor(
    private readonly linkedinService: LinkedinService,
    private readonly apifyService: ApifyService,
    @Inject('Logger') private readonly logger: LogService,
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
  }): Promise<OnboardingLinkedInData | ManualUrlRequiredResult> {
    try {
      // 1. Échanger le code contre un access token
      // Utiliser la redirect_uri spécifique pour l'onboarding
      const onboardingRedirectUri =
        process.env.AUTH_REDIRECT_URI_ONBOARDING ||
        process.env.AUTH_REDIRECT_URI;
      const accessTokenData = await this.linkedinService.getAccessToken({
        transactionId,
        data: {
          code,
          redirectUri: onboardingRedirectUri,
        },
      });

      // 2. Récupérer les informations utilisateur de base
      const userInfo = await this.linkedinService.getUserInfo({
        transactionId,
        accessToken: accessTokenData.access_token,
      });

      // 3. Initialiser les données de profil avec les infos OAuth
      let profileData: OnboardingLinkedInData = {
        profile: {
          firstName: userInfo.given_name || '',
          lastName: userInfo.family_name || '',
          profilePictureUrl: userInfo.picture,
        },
        experiences: [],
        educations: [],
        skills: [],
      };

      // 4. Si on a le linkedinUrl, scraper le profil complet
      if (userInfo.linkedinUrl) {
        try {
          this.logger.info('Scraping LinkedIn profile for onboarding', {
            transactionId,
            userId,
            linkedinUrl: userInfo.linkedinUrl,
          });

          // Scraper le profil complet via Apify
          const scrapedData = await this.apifyService.scrapeLinkedInProfile({
            transactionId,
            linkedinUrl: userInfo.linkedinUrl,
          });

          // Mapper les données scrapées
          if (scrapedData) {
            // Extraire l'URL de la photo
            const photoUrl =
              scrapedData.photo ||
              scrapedData.profilePicture?.url ||
              scrapedData.profilePicture?.sizes?.[0]?.url ||
              userInfo.picture;

            // Extraire la localisation
            const location =
              scrapedData.location?.linkedinText ||
              scrapedData.location?.parsed?.text ||
              scrapedData.location?.parsed?.city ||
              null;

            // Extraire le countryCode et la ville depuis les données parsées
            const countryCode =
              scrapedData.location?.parsed?.countryCode ||
              scrapedData.location?.countryCode ||
              null;
            const city = scrapedData.location?.parsed?.city || null;

            profileData = {
              profile: {
                firstName: scrapedData.firstName || userInfo.given_name || '',
                lastName: scrapedData.lastName || userInfo.family_name || '',
                headline: scrapedData.headline || null,
                location: location,
                countryCode: countryCode || undefined,
                city: city || undefined,
                profilePictureUrl: photoUrl || null,
              },
              experiences: (scrapedData.experience || []).map((exp) => ({
                title: exp.position || '',
                company: exp.companyName || '',
                startDate: exp.startDate?.year
                  ? `${exp.startDate.year}-${String(exp.startDate.month || 1).padStart(2, '0')}-01`
                  : '',
                endDate: exp.endDate?.year
                  ? `${exp.endDate.year}-${String(exp.endDate.month || 1).padStart(2, '0')}-01`
                  : undefined,
                description: exp.description || null,
                location: exp.location || null,
              })),
              educations: (scrapedData.education || []).map((edu) => ({
                school: edu.schoolName || '',
                degree: edu.degree || null,
                fieldOfStudy: edu.fieldOfStudy || null,
                startDate: edu.startDate?.year
                  ? `${edu.startDate.year}-${String(edu.startDate.month || 1).padStart(2, '0')}-01`
                  : '',
                endDate: edu.endDate?.year
                  ? `${edu.endDate.year}-${String(edu.endDate.month || 1).padStart(2, '0')}-01`
                  : undefined,
              })),
              skills:
                scrapedData.skills?.map((skill) => skill.name) ||
                scrapedData.topSkills ||
                [],
            };

            this.logger.info(
              'LinkedIn profile scraped successfully for onboarding',
              {
                transactionId,
                userId,
                experiencesCount: profileData.experiences.length,
                educationsCount: profileData.educations.length,
                skillsCount: profileData.skills.length,
              },
            );
          }
        } catch (scrapingError) {
          this.logger.warn(
            'Failed to scrape LinkedIn profile for onboarding, using OAuth data only',
            {
              transactionId,
              userId,
              error: scrapingError.message,
            },
          );
          // Continue avec les données de base OAuth
        }
      } else {
        this.logger.info(
          'No LinkedIn URL available for onboarding, requiring manual input',
          {
            transactionId,
            userId,
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

      return profileData;
    } catch (error) {
      this.logger.error('Failed to get LinkedIn data for onboarding', {
        transactionId,
        userId,
        error: error.message,
      });
      throw error;
    }
  }
}
