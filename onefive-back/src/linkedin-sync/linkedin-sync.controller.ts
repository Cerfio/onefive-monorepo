import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LogService } from 'logstash-winston-3';
import { FastifyRequest } from 'fastify';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { AllowOnboardingNotComplete } from 'src/common/decorators/allow-onboarding-not-complete.decorator';
import { InitiateLinkedInSyncHandler } from './handlers/initiate-linkedin-sync.handler';
import { GetLinkedInComparisonHandler } from './handlers/get-linkedin-comparison.handler';
import { ApplyLinkedInSyncHandler } from './handlers/apply-linkedin-sync.handler';
import { OAuthLinkedInSyncHandler } from './handlers/oauth-linkedin-sync.handler';
import { OnboardingLinkedInSyncHandler } from './handlers/onboarding-linkedin-sync.handler';
import { CompleteOnboardingLinkedInSyncHandler } from './handlers/complete-onboarding-linkedin-sync.handler';
import { InitiateCompanySyncHandler } from './handlers/initiate-company-sync.handler';
import { GetCompanyComparisonHandler } from './handlers/get-company-comparison.handler';
import { ApplyCompanySyncHandler } from './handlers/apply-company-sync.handler';
import { GetCompanySyncStatusHandler } from './handlers/get-company-sync-status.handler';
import { PreviewCompanySyncHandler } from './handlers/preview-company-sync.handler';
import {
  InitiateLinkedInSyncDto,
  ApplySyncFieldsDto,
  OAuthLinkedInSyncDto,
  CompleteOAuthLinkedInSyncDto,
} from './dto/linkedin-sync.dto';
import {
  InitiateCompanySyncDto,
  ApplyCompanySyncFieldsDto,
} from './dto/linkedin-company-sync.dto';
import { ManualUrlRequiredResult } from './dto/linkedin-sync.dto';

const MANUAL_URL_MESSAGE =
  'LinkedIn connecté avec succès ! Veuillez entrer votre URL de profil LinkedIn pour continuer.';

function isManualUrlRequired(
  result: unknown,
): result is ManualUrlRequiredResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    'requiresManualUrl' in result &&
    (result as ManualUrlRequiredResult).requiresManualUrl === true
  );
}

// Tight throttle for routes that trigger Apify scraping (paid per call).
// Defense-in-depth: most routes also check canSync (24h per profile/startup)
// but this stops brute-force and covers routes without canSync (preview, onboarding).
const SCRAPE_THROTTLE = {
  short: { limit: 1, ttl: 2000 }, // 1 per 2s
  medium: { limit: 3, ttl: 30000 }, // 3 per 30s
  long: { limit: 10, ttl: 3600000 }, // 10 per hour
};

@Controller('linkedin-sync')
export class LinkedInSyncController {
  constructor(
    private readonly initiateLinkedInSyncHandler: InitiateLinkedInSyncHandler,
    private readonly getLinkedInComparisonHandler: GetLinkedInComparisonHandler,
    private readonly applyLinkedInSyncHandler: ApplyLinkedInSyncHandler,
    private readonly oauthLinkedInSyncHandler: OAuthLinkedInSyncHandler,
    private readonly onboardingLinkedInSyncHandler: OnboardingLinkedInSyncHandler,
    private readonly completeOnboardingLinkedInSyncHandler: CompleteOnboardingLinkedInSyncHandler,
    private readonly initiateCompanySyncHandler: InitiateCompanySyncHandler,
    private readonly getCompanyComparisonHandler: GetCompanyComparisonHandler,
    private readonly applyCompanySyncHandler: ApplyCompanySyncHandler,
    private readonly getCompanySyncStatusHandler: GetCompanySyncStatusHandler,
    private readonly previewCompanySyncHandler: PreviewCompanySyncHandler,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  /**
   * Initiate LinkedIn profile scraping
   * Scrapes the LinkedIn profile and returns comparison data
   */
  @Post('/initiate')
  @HttpCode(200)
  @Throttle(SCRAPE_THROTTLE)
  async initiate(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: InitiateLinkedInSyncDto,
  ) {
    const result = await this.initiateLinkedInSyncHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      linkedinUrl: body.linkedinUrl,
    });
    return { success: true, data: result };
  }

  /**
   * Get comparison data between LinkedIn and current profile
   * Uses previously scraped data
   */
  @Get('/comparison')
  async getComparison(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ) {
    const result = await this.getLinkedInComparisonHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data: result };
  }

  /**
   * Apply selected fields from LinkedIn to profile
   */
  @Post('/apply')
  @HttpCode(200)
  async apply(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: ApplySyncFieldsDto,
  ) {
    this.logger.info('Controller /apply - Body received', { body });
    const result = await this.applyLinkedInSyncHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      syncFields: body,
    });
    return { success: true, data: result };
  }

  /**
   * Check if user can sync (rate limit check)
   * Also returns previous sync data if available
   */
  @Get('/status')
  async getStatus(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ) {
    // Récupérer les données de comparaison (sans lancer d'exception si pas de données)
    const comparisonData = await this.getLinkedInComparisonHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      throwIfNoData: false,
    });

    // Si on a des données de sync précédentes
    if (comparisonData) {
      return {
        success: true,
        data: {
          canSync: comparisonData.canSync,
          nextSyncAvailableAt: comparisonData.nextSyncAvailableAt,
          hoursRemaining: comparisonData.hoursRemaining,
          hasPreviousSync: true,
          previousSyncData: comparisonData,
        },
      };
    }

    // Pas de données de sync précédentes
    return {
      success: true,
      data: {
        canSync: true,
        hasPreviousSync: false,
      },
    };
  }

  /**
   * OAuth LinkedIn sync callback
   * Receives the OAuth code, scrapes the profile, and returns comparison data
   * If vanityName is not available, returns requiresManualUrl: true
   */
  @Post('/oauth')
  @HttpCode(200)
  @Throttle(SCRAPE_THROTTLE)
  async oauthSync(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: OAuthLinkedInSyncDto,
  ) {
    this.logger.info('LinkedIn Sync Controller - POST /oauth called', {
      userId: req.userId,
    });

    const result = await this.oauthLinkedInSyncHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      code: body.code,
    });

    if (isManualUrlRequired(result)) {
      return {
        success: true,
        requiresManualUrl: true,
        userInfo: result.userInfo,
        message: MANUAL_URL_MESSAGE,
      };
    }

    return { success: true, data: result };
  }

  /**
   * Complete OAuth LinkedIn sync with manual URL
   * Receives the LinkedIn URL and continues the sync process
   */
  @Post('/oauth/complete')
  @HttpCode(200)
  @Throttle(SCRAPE_THROTTLE)
  async completeOAuthSync(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: CompleteOAuthLinkedInSyncDto,
  ) {
    this.logger.info('LinkedIn Sync Controller - POST /oauth/complete called', {
      userId: req.userId,
      linkedinUrl: body.linkedinUrl,
    });

    // Utiliser le handler initiate avec l'URL fournie
    const result = await this.initiateLinkedInSyncHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      linkedinUrl: body.linkedinUrl,
    });
    return { success: true, data: result };
  }

  /**
   * Get LinkedIn data for onboarding
   * Returns profile data, experiences, educations, and skills for profile creation
   */
  @AllowOnboardingNotComplete()
  @Post('/onboarding')
  @HttpCode(200)
  @Throttle(SCRAPE_THROTTLE)
  async getOnboardingData(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: OAuthLinkedInSyncDto,
  ) {
    this.logger.info('LinkedIn Sync Controller - POST /onboarding called', {
      userId: req.userId,
    });

    const result = await this.onboardingLinkedInSyncHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      code: body.code,
    });

    if (isManualUrlRequired(result)) {
      return {
        success: true,
        requiresManualUrl: true,
        userInfo: result.userInfo,
        message: MANUAL_URL_MESSAGE,
      };
    }

    return { success: true, data: result };
  }

  /**
   * Complete Onboarding LinkedIn sync with manual URL
   */
  @AllowOnboardingNotComplete()
  @Post('/onboarding/complete')
  @HttpCode(200)
  @Throttle(SCRAPE_THROTTLE)
  async completeOnboardingSync(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: CompleteOAuthLinkedInSyncDto,
  ) {
    this.logger.info(
      'LinkedIn Sync Controller - POST /onboarding/complete called',
      { userId: req.userId, linkedinUrl: body.linkedinUrl },
    );

    const result = await this.completeOnboardingLinkedInSyncHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      linkedinUrl: body.linkedinUrl,
    });
    return { success: true, data: result };
  }

  // ============================================
  // STARTUP / COMPANY SYNC ENDPOINTS
  // ============================================

  /**
   * Get sync status for a startup
   */
  @Get('/company/:startupId/status')
  async getCompanyStatus(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('startupId') startupId: string,
  ) {
    const result = await this.getCompanySyncStatusHandler.execute({
      transactionId: req.id,
      startupId,
      userId: req.userId,
    });
    return { success: true, data: result };
  }

  /**
   * Initiate LinkedIn company scraping
   */
  @Post('/company/:startupId/initiate')
  @HttpCode(200)
  @Throttle(SCRAPE_THROTTLE)
  async initiateCompany(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('startupId') startupId: string,
    @Body() body: InitiateCompanySyncDto,
  ) {
    const result = await this.initiateCompanySyncHandler.execute({
      transactionId: req.id,
      startupId,
      userId: req.userId,
      dto: body,
    });
    return { success: true, data: result };
  }

  /**
   * Get comparison data between LinkedIn company and current startup
   */
  @Get('/company/:startupId/comparison')
  async getCompanyComparison(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('startupId') startupId: string,
  ) {
    const result = await this.getCompanyComparisonHandler.execute({
      transactionId: req.id,
      startupId,
      userId: req.userId,
    });
    return { success: true, data: result };
  }

  /**
   * Apply selected fields from LinkedIn to startup
   */
  @Post('/company/:startupId/apply')
  @HttpCode(200)
  async applyCompany(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Param('startupId') startupId: string,
    @Body() body: ApplyCompanySyncFieldsDto,
  ) {
    const result = await this.applyCompanySyncHandler.execute({
      transactionId: req.id,
      startupId,
      userId: req.userId,
      syncFields: body,
    });
    return { success: true, data: result };
  }

  /**
   * Preview LinkedIn company data
   * Scrapes the LinkedIn company page and returns data without saving
   */
  @Post('/company/preview')
  @HttpCode(200)
  @Throttle(SCRAPE_THROTTLE)
  async previewCompany(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: InitiateCompanySyncDto,
  ) {
    try {
      const result = await this.previewCompanySyncHandler.execute({
        transactionId: req.id,
        linkedinUrl: body.linkedinUrl,
      });
      return { success: true, data: result };
    } catch (error: any) {
      // Logger l'erreur avec tous les détails avant de la relancer
      this.logger.error('Error in LinkedInSyncController.previewCompany', {
        transactionId: req.id,
        linkedinUrl: body.linkedinUrl,
        error: error.message,
      });
      throw error;
    }
  }
}
