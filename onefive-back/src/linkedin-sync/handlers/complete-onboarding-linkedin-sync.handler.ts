import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ApifyService } from '../apify.service';
import { OnboardingLinkedInData } from './onboarding-linkedin-sync.handler';

@Injectable()
export class CompleteOnboardingLinkedInSyncHandler {
  constructor(
    private readonly apifyService: ApifyService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    linkedinUrl,
  }: {
    transactionId: string;
    userId: string;
    linkedinUrl: string;
  }): Promise<OnboardingLinkedInData> {
    try {
      this.logger.info(
        'Scraping LinkedIn profile for onboarding (manual URL)',
        {
          transactionId,
          userId,
          linkedinUrl,
        },
      );

      // Scraper le profil complet via Apify
      const scrapedData = await this.apifyService.scrapeLinkedInProfile({
        transactionId,
        linkedinUrl: linkedinUrl,
      });

      // Mapper les données scrapées
      if (scrapedData) {
        // Extraire l'URL de la photo
        const photoUrl =
          scrapedData.photo ||
          scrapedData.profilePicture?.url ||
          scrapedData.profilePicture?.sizes?.[0]?.url ||
          null;

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

        const profileData: OnboardingLinkedInData = {
          profile: {
            firstName: scrapedData.firstName || '',
            lastName: scrapedData.lastName || '',
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
          'LinkedIn profile scraped successfully for onboarding (manual URL)',
          {
            transactionId,
            userId,
            experiencesCount: profileData.experiences.length,
            educationsCount: profileData.educations.length,
            skillsCount: profileData.skills.length,
          },
        );

        return profileData;
      }

      throw new InternalServerErrorException('Failed to scrape data');
    } catch (error) {
      this.logger.error(
        'Failed to get LinkedIn data for onboarding (manual URL)',
        {
          transactionId,
          userId,
          error: error.message,
        },
      );
      throw error;
    }
  }
}
