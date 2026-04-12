import { Module } from '@nestjs/common';
import { LinkedInSyncController } from './linkedin-sync.controller';
import { LinkedInSyncService } from './linkedin-sync.service';
import { LinkedInCompanySyncService } from './linkedin-company-sync.service';
import { ApifyService } from './apify.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from 'src/common/logger/logger.provider';
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
import { ProfileModule } from 'src/profile/profile.module';
import { ExperienceModule } from 'src/experience/experience.module';
import { EducationModule } from 'src/education/education.module';
import { StorageModule } from 'src/storage/storage.module';
import { ConfigModule } from '@nestjs/config';
import { LinkedinModule } from 'src/linkedin/linkedin.module';

@Module({
  imports: [
    PrismaModule,
    ProfileModule,
    ExperienceModule,
    EducationModule,
    StorageModule,
    ConfigModule,
    LinkedinModule,
  ],
  controllers: [LinkedInSyncController],
  providers: [
    LoggerProvider,
    LinkedInSyncService,
    LinkedInCompanySyncService,
    ApifyService,
    InitiateLinkedInSyncHandler,
    GetLinkedInComparisonHandler,
    ApplyLinkedInSyncHandler,
    OAuthLinkedInSyncHandler,
    OnboardingLinkedInSyncHandler,
    CompleteOnboardingLinkedInSyncHandler,
    InitiateCompanySyncHandler,
    GetCompanyComparisonHandler,
    ApplyCompanySyncHandler,
    GetCompanySyncStatusHandler,
    PreviewCompanySyncHandler,
  ],
  exports: [LinkedInSyncService, LinkedInCompanySyncService],
})
export class LinkedInSyncModule {}
