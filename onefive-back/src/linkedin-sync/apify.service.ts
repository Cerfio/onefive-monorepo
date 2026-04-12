import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../common/logger/logger.decorator';
import axios from 'axios';
import {
  ApifyLinkedInResponseSchema,
  LinkedInProfile,
} from './schemas/linkedin-profile.schema';
import {
  ApifyLinkedInCompanyResponseSchema,
  LinkedInCompany,
} from './schemas/linkedin-company.schema';
import {
  ApifyScrapingException,
  ApifyValidationException,
} from './linkedin-sync.exception';

@Injectable()
export class ApifyService {
  constructor(@Inject('Logger') private readonly logger: LogService) {}

  @Log()
  async scrapeLinkedInProfile({
    transactionId,
    linkedinUrl,
  }: {
    transactionId: string;
    linkedinUrl: string;
  }): Promise<LinkedInProfile> {
    const apifyToken = process.env.APIFY_API_TOKEN;
    const actorId =
      process.env.APIFY_LINKEDIN_ACTOR_ID ||
      'harvestapi~linkedin-profile-scraper';

    if (!apifyToken) {
      this.logger.error('APIFY_API_TOKEN is not configured', { transactionId });
      ApifyScrapingException.throw(this.logger, {
        transactionId,
        linkedinUrl,
        error: 'APIFY_API_TOKEN is not configured',
        timestamp: new Date().toISOString(),
      });
    }

    let response;
    try {
      // Appel à l'API Apify pour lancer le scraping synchrone
      response = await axios.post(
        `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`,
        {
          profileScraperMode: 'Profile details no email ($4 per 1k)',
          queries: [linkedinUrl],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apifyToken}`,
          },
          params: {
            token: apifyToken,
          },
          timeout: 180000, // 3 minutes timeout pour le scraping
        },
      );
    } catch (error: any) {
      this.logger.error('Error scraping LinkedIn profile', {
        transactionId,
        linkedinUrl,
        error: error.message,
      });
      ApifyScrapingException.throw(this.logger, {
        transactionId,
        linkedinUrl,
        error: error.response?.data?.error?.message || error.message,
        statusCode: error.response?.status,
        timestamp: new Date().toISOString(),
      });
    }

    // Valider la réponse avec le schema Zod
    try {
      // Logger la réponse brute pour debug
      this.logger.debug('Apify response received', {
        transactionId,
        linkedinUrl,
        responseLength: response.data?.length || 0,
        responseType: Array.isArray(response.data)
          ? 'array'
          : typeof response.data,
        firstItemPreview: response.data?.[0]
          ? JSON.stringify(response.data[0]).slice(0, 200)
          : 'no data',
      });

      const parsed = ApifyLinkedInResponseSchema.parse(response.data);

      if (!parsed || parsed.length === 0) {
        this.logger.error('No profile data returned from Apify', {
          transactionId,
          linkedinUrl,
          responseData: JSON.stringify(response.data),
          timestamp: new Date().toISOString(),
        });
        ApifyValidationException.throw(this.logger, {
          transactionId,
          linkedinUrl,
          error: 'No profile data returned from Apify',
          responseData: JSON.stringify(response.data),
          timestamp: new Date().toISOString(),
        });
      }

      return parsed[0];
    } catch (error: any) {
      if (error.name?.includes('Exception')) {
        throw error;
      }

      // Logger les détails complets de l'erreur de validation
      const errorDetails = {
        transactionId,
        linkedinUrl,
        errorMessage: error.message,
        errorName: error.name,
        zodErrors: error.errors || error.issues || 'No Zod errors available',
        responseData: response.data
          ? JSON.stringify(response.data).slice(0, 2000)
          : 'No response data',
        responseDataType: Array.isArray(response.data)
          ? 'array'
          : typeof response.data,
        responseDataLength: response.data?.length || 0,
        timestamp: new Date().toISOString(),
      };

      // Logger avec Winston et console pour garantir la visibilité
      this.logger.error('Apify validation failed (profile)', errorDetails);

      ApifyValidationException.throw(this.logger, {
        transactionId,
        linkedinUrl,
        error: error.message || 'Validation failed',
        zodErrors: error.errors || error.issues,
        responseData: JSON.stringify(response.data).slice(0, 2000),
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Log()
  async scrapeLinkedInCompany({
    transactionId,
    linkedinUrl,
  }: {
    transactionId: string;
    linkedinUrl: string;
  }): Promise<LinkedInCompany> {
    const apifyToken = process.env.APIFY_API_TOKEN;
    const actorId = 'harvestapi~linkedin-company';

    if (!apifyToken) {
      this.logger.error(
        'APIFY_API_TOKEN is not configured for company scraping',
        { transactionId },
      );
      ApifyScrapingException.throw(this.logger, {
        transactionId,
        linkedinUrl,
        error: 'APIFY_API_TOKEN is not configured',
        timestamp: new Date().toISOString(),
      });
    }

    let response;
    try {
      // Appel à l'API Apify pour lancer le scraping synchrone
      response = await axios.post(
        `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`,
        {
          companies: [linkedinUrl],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apifyToken}`,
          },
          params: {
            token: apifyToken,
          },
          timeout: 180000, // 3 minutes timeout pour le scraping
        },
      );
    } catch (error: any) {
      this.logger.error('Error scraping LinkedIn company', {
        transactionId,
        linkedinUrl,
        error: error.message,
      });
      ApifyScrapingException.throw(this.logger, {
        transactionId,
        linkedinUrl,
        error: error.response?.data?.error?.message || error.message,
        statusCode: error.response?.status,
        timestamp: new Date().toISOString(),
      });
    }

    // Valider la réponse avec le schema Zod
    try {
      // Logger la réponse brute pour debug
      this.logger.debug('Apify response received', {
        transactionId,
        linkedinUrl,
        responseLength: response.data?.length || 0,
        responseType: Array.isArray(response.data)
          ? 'array'
          : typeof response.data,
        firstItemPreview: response.data?.[0]
          ? JSON.stringify(response.data[0]).slice(0, 200)
          : 'no data',
      });

      const parsed = ApifyLinkedInCompanyResponseSchema.parse(response.data);

      if (!parsed || parsed.length === 0) {
        const errorInfo = {
          transactionId,
          linkedinUrl,
          responseData: JSON.stringify(response.data),
          timestamp: new Date().toISOString(),
        };
        this.logger.error('No company data returned from Apify', errorInfo);
        ApifyValidationException.throw(this.logger, {
          transactionId,
          linkedinUrl,
          error: 'No company data returned from Apify',
          responseData: JSON.stringify(response.data),
          timestamp: new Date().toISOString(),
        });
      }

      return parsed[0];
    } catch (error: any) {
      if (error.name?.includes('Exception')) {
        throw error;
      }

      // Logger les détails complets de l'erreur de validation
      const errorDetails = {
        transactionId,
        linkedinUrl,
        errorMessage: error.message,
        errorName: error.name,
        zodErrors: error.errors || error.issues || 'No Zod errors available',
        responseData: response.data
          ? JSON.stringify(response.data).slice(0, 2000)
          : 'No response data',
        responseDataType: Array.isArray(response.data)
          ? 'array'
          : typeof response.data,
        responseDataLength: response.data?.length || 0,
        timestamp: new Date().toISOString(),
      };

      this.logger.error('Apify validation failed', errorDetails);

      ApifyValidationException.throw(this.logger, {
        transactionId,
        linkedinUrl,
        error: error.message || 'Validation failed',
        zodErrors: error.errors || error.issues,
        responseData: JSON.stringify(response.data).slice(0, 2000),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
