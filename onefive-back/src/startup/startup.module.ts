import { Module } from '@nestjs/common';
import { StartupController } from './startup.controller';
import { StartupService } from './startup.service';
import { CreateStartupHandler } from './handlers/create-startup.handler';
import { GetUserStartupsHandler } from './handlers/get-user-startups.handler';
import { GetProfileStartupsHandler } from './handlers/get-profile-startups.handler';
import { SearchProfilesHandler } from './handlers/search-profiles.handler';
import { SearchInvestorsHandler } from './handlers/search-investors.handler';
import { GetStartupHandler } from './handlers/get-startup.handler';
import { GetStartupMembersHandler } from './handlers/get-startup-members.handler';
import { UpdateStartupHandler } from './handlers/update-startup.handler';
import { GetFundingHandler } from './handlers/get-funding.handler';
import { UpdateFundingHandler } from './handlers/update-funding.handler';
import { GetFundingHistoryHandler } from './handlers/get-funding-history.handler';
import { CreateFundingHistoryHandler } from './handlers/create-funding-history.handler';
import { UpdateFundingHistoryHandler } from './handlers/update-funding-history.handler';
import { DeleteFundingHistoryHandler } from './handlers/delete-funding-history.handler';
import { UploadStartupLogoHandler } from './handlers/upload-startup-logo.handler';
import { UploadStartupCoverHandler } from './handlers/upload-startup-cover.handler';
import { AddMemberHandler } from './handlers/add-member.handler';
import { UpdateMemberHandler } from './handlers/update-member.handler';
import { RemoveMemberHandler } from './handlers/remove-member.handler';
import { LeaveStartupHandler } from './handlers/leave-startup.handler';
import { TransferOwnershipHandler } from './handlers/transfer-ownership.handler';
import { DeleteStartupHandler } from './handlers/delete-startup.handler';
import { GetStartupInvitationsHandler } from './handlers/get-startup-invitations.handler';
import { CancelInvitationHandler } from './handlers/cancel-invitation.handler';
import { RespondInvestorInvitationHandler } from './handlers/respond-investor-invitation.handler';
import { RespondInvestorInvitationByTokenHandler } from './handlers/respond-investor-invitation-by-token.handler';
import { GetInvestorInvitationByTokenHandler } from './handlers/get-investor-invitation-by-token.handler';
import { ToggleInvestorVisibilityHandler } from './handlers/toggle-investor-visibility.handler';
import { GetMyInvestmentsHandler } from './handlers/get-my-investments.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from '../common/logger/logger.provider';
import { SessionsModule } from '../sessions/sessions.module';
import { StorageModule } from '../storage/storage.module';
import { FileProcessingService } from '../common/services/file-processing.service';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from '../notification/notification.module';
import { ProfileRelationshipsModule } from '../profile-relationships/profile-relationships.module';
import { EmailModule } from '../email/email.module';
import { DataroomModule } from '../dataroom/dataroom.module';

@Module({
  imports: [
    PrismaModule,
    SessionsModule,
    StorageModule,
    ConfigModule,
    NotificationModule,
    ProfileRelationshipsModule,
    EmailModule,
    DataroomModule,
  ],
  controllers: [StartupController],
  providers: [
    StartupService,
    CreateStartupHandler,
    GetUserStartupsHandler,
    GetProfileStartupsHandler,
    SearchProfilesHandler,
    SearchInvestorsHandler,
    GetStartupHandler,
    GetStartupMembersHandler,
    UpdateStartupHandler,
    GetFundingHandler,
    UpdateFundingHandler,
    GetFundingHistoryHandler,
    CreateFundingHistoryHandler,
    UpdateFundingHistoryHandler,
    DeleteFundingHistoryHandler,
    UploadStartupLogoHandler,
    UploadStartupCoverHandler,
    AddMemberHandler,
    UpdateMemberHandler,
    RemoveMemberHandler,
    LeaveStartupHandler,
    TransferOwnershipHandler,
    DeleteStartupHandler,
    GetStartupInvitationsHandler,
    CancelInvitationHandler,
    RespondInvestorInvitationHandler,
    RespondInvestorInvitationByTokenHandler,
    GetInvestorInvitationByTokenHandler,
    ToggleInvestorVisibilityHandler,
    GetMyInvestmentsHandler,
    LoggerProvider,
    FileProcessingService,
  ],
  exports: [
    StartupService,
    CreateStartupHandler,
    GetUserStartupsHandler,
    SearchProfilesHandler,
    SearchInvestorsHandler,
    GetStartupHandler,
    UpdateStartupHandler,
    GetFundingHandler,
    UpdateFundingHandler,
    GetFundingHistoryHandler,
    CreateFundingHistoryHandler,
    UpdateFundingHistoryHandler,
    DeleteFundingHistoryHandler,
  ],
})
export class StartupModule {}
