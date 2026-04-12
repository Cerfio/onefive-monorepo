import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerProvider } from 'src/common/logger/logger.provider';
import { FileProcessingService } from 'src/common/services/file-processing.service';
import { DiscussionModule } from 'src/discussion/discussion.module';
import { StorageModule } from 'src/storage/storage.module';
import { EmailModule } from 'src/email/email.module';
import { PostModule } from 'src/post/post.module';
import { SpotlightModule } from 'src/spotlight/spotlight.module';
import { WaitlistModule } from 'src/waitlist/waitlist.module';
import { ReportModule } from 'src/report/report.module';
import { FeedbackModule } from 'src/feedback/feedback.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { AdminPermissionGuard } from './guards/admin-permission.guard';
import { AdminSigninHandler } from './handlers/admin-signin.handler';
import { AdminLogoutHandler } from './handlers/admin-logout.handler';
import { AdminCreateInvitationHandler } from './handlers/admin-create-invitation.handler';
import { AdminAcceptInvitationHandler } from './handlers/admin-accept-invitation.handler';
import { AdminGetUserHandler } from './handlers/admin-get-user.handler';
import { AdminListUsersHandler } from './handlers/admin-list-users.handler';
import { AdminBanUserHandler } from './handlers/admin-ban-user.handler';
import { AdminDeleteUserHandler } from './handlers/admin-delete-user.handler';
import { AdminToggleAmbassadorHandler } from './handlers/admin-toggle-ambassador.handler';
import { AdminChangeWaitlistStatusHandler } from './handlers/admin-change-waitlist-status.handler';
import { AdminVerifyEmailHandler } from './handlers/admin-verify-email.handler';
import { AdminListWaitlistHandler } from './handlers/admin-list-waitlist.handler';
import { AdminAcceptWaitlistHandler } from './handlers/admin-accept-waitlist.handler';
import { AdminIgnoreWaitlistHandler } from './handlers/admin-ignore-waitlist.handler';
import { AdminBulkAcceptWaitlistHandler } from './handlers/admin-bulk-accept-waitlist.handler';
import { AdminGetPostHandler } from './handlers/admin-get-post.handler';
import { AdminListPostsHandler } from './handlers/admin-list-posts.handler';
import { AdminDeletePostHandler } from './handlers/admin-delete-post.handler';
import { AdminGetDiscussionHandler } from './handlers/admin-get-discussion.handler';
import { AdminListDiscussionsHandler } from './handlers/admin-list-discussions.handler';
import { AdminDeleteDiscussionHandler } from './handlers/admin-delete-discussion.handler';
import { AdminListSpotlightHandler } from './handlers/admin-list-spotlight.handler';
import { AdminCreateSpotlightHandler } from './handlers/admin-create-spotlight.handler';
import { AdminUpdateSpotlightHandler } from './handlers/admin-update-spotlight.handler';
import { AdminDeleteSpotlightHandler } from './handlers/admin-delete-spotlight.handler';
import { AdminGetSpotlightHandler } from './handlers/admin-get-spotlight.handler';
import { AdminGetStartupHandler } from './handlers/admin-get-startup.handler';
import { AdminListStartupsHandler } from './handlers/admin-list-startups.handler';
import { AdminDeleteStartupHandler } from './handlers/admin-delete-startup.handler';
import { AdminListAdminUsersHandler } from './handlers/admin-list-admin-users.handler';
import { AdminListRolesHandler } from './handlers/admin-list-roles.handler';
import { AdminUpdateAdminRoleHandler } from './handlers/admin-update-admin-role.handler';
import { AdminSetSuperAdminHandler } from './handlers/admin-set-superadmin.handler';
import { AdminSetAdminActiveHandler } from './handlers/admin-set-admin-active.handler';
import { AdminListInvitationsHandler } from './handlers/admin-list-invitations.handler';
import { AdminRevokeInvitationHandler } from './handlers/admin-revoke-invitation.handler';
import { AdminHidePostHandler } from './handlers/admin-hide-post.handler';
import { AdminHideDiscussionHandler } from './handlers/admin-hide-discussion.handler';
import { AdminBulkBanUsersHandler } from './handlers/admin-bulk-ban-users.handler';
import { AdminBulkDeleteUsersHandler } from './handlers/admin-bulk-delete-users.handler';
import { AdminExportUsersHandler } from './handlers/admin-export-users.handler';
import { AdminExportWaitlistHandler } from './handlers/admin-export-waitlist.handler';
import { AdminExportAuditLogsHandler } from './handlers/admin-export-audit-logs.handler';
import { AdminUpdateProfileHandler } from './handlers/admin-update-profile.handler';
import { AdminListAuditLogsHandler } from './handlers/admin-list-audit-logs.handler';
import { AdminGetAuditLogHandler } from './handlers/admin-get-audit-log.handler';
import { AdminDashboardStatsHandler } from './handlers/admin-dashboard-stats.handler';
import { AdminListDataroomsHandler } from './handlers/admin-list-datarooms.handler';
import { AdminImportSpotlightImageHandler } from './handlers/admin-import-spotlight-image.handler';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    WaitlistModule,
    PostModule,
    DiscussionModule,
    SpotlightModule,
    EmailModule,
    ReportModule,
    FeedbackModule,
  ],
  controllers: [AdminAuthController, AdminController],
  providers: [
    AdminService,
    AdminSessionGuard,
    AdminPermissionGuard,
    AdminSigninHandler,
    AdminLogoutHandler,
    AdminCreateInvitationHandler,
    AdminAcceptInvitationHandler,
    AdminGetUserHandler,
    AdminListUsersHandler,
    AdminBanUserHandler,
    AdminDeleteUserHandler,
    AdminToggleAmbassadorHandler,
    AdminChangeWaitlistStatusHandler,
    AdminVerifyEmailHandler,
    AdminListWaitlistHandler,
    AdminAcceptWaitlistHandler,
    AdminIgnoreWaitlistHandler,
    AdminBulkAcceptWaitlistHandler,
    AdminGetPostHandler,
    AdminListPostsHandler,
    AdminDeletePostHandler,
    AdminGetDiscussionHandler,
    AdminListDiscussionsHandler,
    AdminDeleteDiscussionHandler,
    AdminListSpotlightHandler,
    AdminCreateSpotlightHandler,
    AdminUpdateSpotlightHandler,
    AdminDeleteSpotlightHandler,
    AdminGetSpotlightHandler,
    AdminGetStartupHandler,
    AdminListStartupsHandler,
    AdminDeleteStartupHandler,
    AdminListAdminUsersHandler,
    AdminListRolesHandler,
    AdminUpdateAdminRoleHandler,
    AdminSetSuperAdminHandler,
    AdminSetAdminActiveHandler,
    AdminListInvitationsHandler,
    AdminRevokeInvitationHandler,
    AdminHidePostHandler,
    AdminHideDiscussionHandler,
    AdminBulkBanUsersHandler,
    AdminBulkDeleteUsersHandler,
    AdminExportUsersHandler,
    AdminExportWaitlistHandler,
    AdminExportAuditLogsHandler,
    AdminUpdateProfileHandler,
    AdminListAuditLogsHandler,
    AdminGetAuditLogHandler,
    AdminDashboardStatsHandler,
    AdminListDataroomsHandler,
    AdminImportSpotlightImageHandler,
    FileProcessingService,
    LoggerProvider,
  ],
  exports: [AdminService],
})
export class AdminModule {}
