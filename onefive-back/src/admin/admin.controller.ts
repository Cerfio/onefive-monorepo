import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateSpotDto } from 'src/spotlight/dto/create-spot.dto';
import { AdminImportSpotlightImageDto } from './dto/admin-spotlight.dto';
import { AdminPermissionGuard } from './guards/admin-permission.guard';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { RequireAdminPermissions } from './admin.decorators';
import { ADMIN_PERMISSIONS } from './admin.constants';
import {
  AdminUsersPaginationDto,
  AdminPaginationDto,
  AdminSearchPaginationDto,
  AdminAuditLogsPaginationDto,
} from './dto/admin-pagination.dto';
import { AdminGetUserHandler } from './handlers/admin-get-user.handler';
import { AdminListUsersHandler } from './handlers/admin-list-users.handler';
import { AdminBanUserDto, AdminToggleAmbassadorDto, AdminChangeWaitlistStatusDto } from './dto/admin-user.dto';
import { AdminBanUserHandler } from './handlers/admin-ban-user.handler';
import { AdminDeleteUserHandler } from './handlers/admin-delete-user.handler';
import { AdminToggleAmbassadorHandler } from './handlers/admin-toggle-ambassador.handler';
import { AdminChangeWaitlistStatusHandler } from './handlers/admin-change-waitlist-status.handler';
import { AdminVerifyEmailHandler } from './handlers/admin-verify-email.handler';
import { FastifyAdminRequest } from './admin-request.type';
import { AdminListWaitlistHandler } from './handlers/admin-list-waitlist.handler';
import { AdminAcceptWaitlistHandler } from './handlers/admin-accept-waitlist.handler';
import { AdminIgnoreWaitlistHandler } from './handlers/admin-ignore-waitlist.handler';
import { AdminBulkAcceptWaitlistHandler } from './handlers/admin-bulk-accept-waitlist.handler';
import { AdminBulkAcceptWaitlistDto } from './dto/admin-waitlist.dto';
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
import { AdminImportSpotlightImageHandler } from './handlers/admin-import-spotlight-image.handler';
import { AdminGetStartupHandler } from './handlers/admin-get-startup.handler';
import { AdminListStartupsHandler } from './handlers/admin-list-startups.handler';
import { AdminDeleteStartupHandler } from './handlers/admin-delete-startup.handler';
import {
  AdminSetActiveDto,
  AdminToggleSuperAdminDto,
  AdminUpdateRoleDto,
} from './dto/admin-management.dto';
import { AdminListAdminUsersHandler } from './handlers/admin-list-admin-users.handler';
import { AdminListRolesHandler } from './handlers/admin-list-roles.handler';
import { AdminUpdateAdminRoleHandler } from './handlers/admin-update-admin-role.handler';
import { AdminSetSuperAdminHandler } from './handlers/admin-set-superadmin.handler';
import { AdminSetAdminActiveHandler } from './handlers/admin-set-admin-active.handler';
import { AdminListInvitationsHandler } from './handlers/admin-list-invitations.handler';
import { AdminRevokeInvitationHandler } from './handlers/admin-revoke-invitation.handler';
import { AdminHidePostHandler } from './handlers/admin-hide-post.handler';
import { AdminHideDiscussionHandler } from './handlers/admin-hide-discussion.handler';
import { AdminHideDto } from './dto/admin-moderation.dto';
import { AdminBulkBanUsersHandler } from './handlers/admin-bulk-ban-users.handler';
import { AdminBulkDeleteUsersHandler } from './handlers/admin-bulk-delete-users.handler';
import { AdminBulkBanDto, AdminBulkDeleteDto } from './dto/admin-bulk.dto';
import { AdminExportUsersHandler } from './handlers/admin-export-users.handler';
import { AdminExportWaitlistHandler } from './handlers/admin-export-waitlist.handler';
import { AdminExportAuditLogsHandler } from './handlers/admin-export-audit-logs.handler';
import { AdminUpdateProfileHandler } from './handlers/admin-update-profile.handler';
import { AdminUpdateProfileDto } from './dto/admin-profile.dto';
import { AdminListAuditLogsHandler } from './handlers/admin-list-audit-logs.handler';
import { AdminGetAuditLogHandler } from './handlers/admin-get-audit-log.handler';
import { AdminDashboardStatsHandler } from './handlers/admin-dashboard-stats.handler';
import { AdminListDataroomsHandler } from './handlers/admin-list-datarooms.handler';
import { ReportService } from '../report/report.service';
import { FeedbackService } from '../feedback/feedback.service';
import { AdminService } from './admin.service';

@Public()
@Controller('admin')
@UseGuards(AdminSessionGuard, AdminPermissionGuard)
export class AdminController {
  constructor(
    private readonly getUserHandler: AdminGetUserHandler,
    private readonly listUsersHandler: AdminListUsersHandler,
    private readonly banUserHandler: AdminBanUserHandler,
    private readonly deleteUserHandler: AdminDeleteUserHandler,
    private readonly toggleAmbassadorHandler: AdminToggleAmbassadorHandler,
    private readonly changeWaitlistStatusHandler: AdminChangeWaitlistStatusHandler,
    private readonly verifyEmailHandler: AdminVerifyEmailHandler,
    private readonly listWaitlistHandler: AdminListWaitlistHandler,
    private readonly acceptWaitlistHandler: AdminAcceptWaitlistHandler,
    private readonly ignoreWaitlistHandler: AdminIgnoreWaitlistHandler,
    private readonly bulkAcceptWaitlistHandler: AdminBulkAcceptWaitlistHandler,
    private readonly getPostHandler: AdminGetPostHandler,
    private readonly listPostsHandler: AdminListPostsHandler,
    private readonly deletePostHandler: AdminDeletePostHandler,
    private readonly getDiscussionHandler: AdminGetDiscussionHandler,
    private readonly listDiscussionsHandler: AdminListDiscussionsHandler,
    private readonly deleteDiscussionHandler: AdminDeleteDiscussionHandler,
    private readonly listSpotlightHandler: AdminListSpotlightHandler,
    private readonly createSpotlightHandler: AdminCreateSpotlightHandler,
    private readonly updateSpotlightHandler: AdminUpdateSpotlightHandler,
    private readonly deleteSpotlightHandler: AdminDeleteSpotlightHandler,
    private readonly getSpotlightHandler: AdminGetSpotlightHandler,
    private readonly importSpotlightImageHandler: AdminImportSpotlightImageHandler,
    private readonly getStartupHandler: AdminGetStartupHandler,
    private readonly listStartupsHandler: AdminListStartupsHandler,
    private readonly deleteStartupHandler: AdminDeleteStartupHandler,
    private readonly listAdminUsersHandler: AdminListAdminUsersHandler,
    private readonly listRolesHandler: AdminListRolesHandler,
    private readonly updateAdminRoleHandler: AdminUpdateAdminRoleHandler,
    private readonly setSuperAdminHandler: AdminSetSuperAdminHandler,
    private readonly setAdminActiveHandler: AdminSetAdminActiveHandler,
    private readonly listInvitationsHandler: AdminListInvitationsHandler,
    private readonly revokeInvitationHandler: AdminRevokeInvitationHandler,
    private readonly hidePostHandler: AdminHidePostHandler,
    private readonly hideDiscussionHandler: AdminHideDiscussionHandler,
    private readonly bulkBanUsersHandler: AdminBulkBanUsersHandler,
    private readonly bulkDeleteUsersHandler: AdminBulkDeleteUsersHandler,
    private readonly exportUsersHandler: AdminExportUsersHandler,
    private readonly exportWaitlistHandler: AdminExportWaitlistHandler,
    private readonly exportAuditLogsHandler: AdminExportAuditLogsHandler,
    private readonly updateProfileHandler: AdminUpdateProfileHandler,
    private readonly listAuditLogsHandler: AdminListAuditLogsHandler,
    private readonly getAuditLogHandler: AdminGetAuditLogHandler,
    private readonly dashboardStatsHandler: AdminDashboardStatsHandler,
    private readonly listDataroomsHandler: AdminListDataroomsHandler,
    private readonly reportService: ReportService,
    private readonly feedbackService: FeedbackService,
    private readonly adminService: AdminService,
  ) {}

  private getUserAgent(req: FastifyAdminRequest): string | undefined {
    const userAgent = req.headers['user-agent'];
    if (Array.isArray(userAgent)) {
      return userAgent[0];
    }
    return userAgent;
  }

  @Get('users')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_READ)
  async listUsers(@Query() query: AdminUsersPaginationDto) {
    const { items, total } = await this.listUsersHandler.execute({
      skip: query.skip ?? 0,
      take: query.take ?? 20,
      search: query.search,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
    return { success: true, data: items, total };
  }

  @Get('users/export')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_READ)
  async exportUsers() {
    const csv = await this.exportUsersHandler.execute();
    return { success: true, data: csv };
  }

  @Post('users/bulk-ban')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_MANAGE)
  async bulkBanUsers(
    @Req() req: FastifyAdminRequest,
    @Body() body: AdminBulkBanDto,
  ) {
    const result = await this.bulkBanUsersHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      userIds: body.ids,
      isBanned: body.isBanned,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Post('users/bulk-delete')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_MANAGE)
  async bulkDeleteUsers(
    @Req() req: FastifyAdminRequest,
    @Body() body: AdminBulkDeleteDto,
  ) {
    const result = await this.bulkDeleteUsersHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      userIds: body.ids,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Get('users/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_READ)
  async getUser(@Param('id') userId: string) {
    const user = await this.getUserHandler.execute({ userId });
    return { success: true, data: user };
  }

  @Patch('users/:id/ban')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_MANAGE)
  async banUser(
    @Req() req: FastifyAdminRequest,
    @Param('id') userId: string,
    @Body() body: AdminBanUserDto,
  ) {
    const result = await this.banUserHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      targetUserId: userId,
      isBanned: body.isBanned,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Delete('users/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_MANAGE)
  async deleteUser(
    @Req() req: FastifyAdminRequest,
    @Param('id') userId: string,
  ) {
    const result = await this.deleteUserHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      targetUserId: userId,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Patch('users/:id/ambassador')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_MANAGE)
  async toggleAmbassador(
    @Req() req: FastifyAdminRequest,
    @Param('id') userId: string,
    @Body() body: AdminToggleAmbassadorDto,
  ) {
    const result = await this.toggleAmbassadorHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      targetUserId: userId,
      isAmbassador: body.isAmbassador,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Patch('users/:id/waitlist-status')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_MANAGE)
  async changeWaitlistStatus(
    @Req() req: FastifyAdminRequest,
    @Param('id') userId: string,
    @Body() body: AdminChangeWaitlistStatusDto,
  ) {
    const result = await this.changeWaitlistStatusHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      targetUserId: userId,
      waitlistStatus: body.waitlistStatus,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Patch('users/:id/verify-email')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_MANAGE)
  async verifyEmail(
    @Req() req: FastifyAdminRequest,
    @Param('id') userId: string,
  ) {
    const result = await this.verifyEmailHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      targetUserId: userId,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Get('waitlist')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_WAITLIST_MANAGE)
  async listWaitlist(@Query() query: AdminSearchPaginationDto) {
    const { items, total } = await this.listWaitlistHandler.execute({
      skip: query.skip ?? 0,
      take: query.take ?? 20,
      search: query.search,
    });
    return { success: true, data: items, total };
  }

  @Get('waitlist/export')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_WAITLIST_MANAGE)
  async exportWaitlist() {
    const csv = await this.exportWaitlistHandler.execute();
    return { success: true, data: csv };
  }

  @Patch('waitlist/:profileId/accept')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_WAITLIST_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async acceptWaitlist(
    @Req() req: FastifyAdminRequest,
    @Param('profileId') profileId: string,
  ) {
    await this.acceptWaitlistHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      profileId,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
  }

  @Patch('waitlist/:profileId/ignore')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_WAITLIST_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async ignoreWaitlist(
    @Req() req: FastifyAdminRequest,
    @Param('profileId') profileId: string,
  ) {
    await this.ignoreWaitlistHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      profileId,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
  }

  @Post('waitlist/bulk-accept')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_WAITLIST_MANAGE)
  async bulkAcceptWaitlist(
    @Req() req: FastifyAdminRequest,
    @Body() body: AdminBulkAcceptWaitlistDto,
  ) {
    const result = await this.bulkAcceptWaitlistHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      count: body.count,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Get('posts')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async listPosts(@Query() query: AdminSearchPaginationDto) {
    const { items, total } = await this.listPostsHandler.execute({
      skip: query.skip ?? 0,
      take: query.take ?? 20,
      search: query.search,
    });
    return { success: true, data: items, total };
  }

  @Get('posts/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async getPost(@Param('id') postId: string) {
    const post = await this.getPostHandler.execute({ postId });
    return { success: true, data: post };
  }

  @Delete('posts/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Req() req: FastifyAdminRequest,
    @Param('id') postId: string,
  ) {
    await this.deletePostHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      postId,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
  }

  @Get('discussions')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async listDiscussions(@Query() query: AdminSearchPaginationDto) {
    const { items, total } = await this.listDiscussionsHandler.execute({
      skip: query.skip ?? 0,
      take: query.take ?? 20,
      search: query.search,
    });
    return { success: true, data: items, total };
  }

  @Get('discussions/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async getDiscussion(@Param('id') discussionId: string) {
    const discussion = await this.getDiscussionHandler.execute({ discussionId });
    return { success: true, data: discussion };
  }

  @Delete('discussions/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDiscussion(
    @Req() req: FastifyAdminRequest,
    @Param('id') discussionId: string,
  ) {
    await this.deleteDiscussionHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      discussionId,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
  }

  @Get('spotlight')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_SPOTLIGHT_MANAGE)
  async listSpotlight(@Query() query: AdminPaginationDto) {
    const { items, total } = await this.listSpotlightHandler.execute({
      skip: query.skip ?? 0,
      take: query.take ?? 20,
    });
    return { success: true, data: items, total };
  }

  @Get('spotlight/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_SPOTLIGHT_MANAGE)
  async getSpotlight(@Param('id') spotId: string) {
    const spot = await this.getSpotlightHandler.execute({ spotId });
    return { success: true, data: spot };
  }

  @Post('spotlight/image/import-from-url')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_SPOTLIGHT_MANAGE)
  async importSpotlightImage(
    @Req() req: FastifyAdminRequest,
    @Body() body: AdminImportSpotlightImageDto,
  ) {
    const result = await this.importSpotlightImageHandler.execute({
      transactionId: req.id,
      url: body.url,
    });
    return { success: true, data: result };
  }

  @Post('spotlight')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_SPOTLIGHT_MANAGE)
  async createSpotlight(
    @Req() req: FastifyAdminRequest,
    @Body() body: CreateSpotDto,
  ) {
    const spot = await this.createSpotlightHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      spotData: body,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: spot };
  }

  @Patch('spotlight/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_SPOTLIGHT_MANAGE)
  async updateSpotlight(
    @Req() req: FastifyAdminRequest,
    @Param('id') spotId: string,
    @Body() body: Partial<CreateSpotDto>,
  ) {
    const spot = await this.updateSpotlightHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      spotId,
      spotData: body,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: spot };
  }

  @Delete('spotlight/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_SPOTLIGHT_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpotlight(
    @Req() req: FastifyAdminRequest,
    @Param('id') spotId: string,
  ) {
    await this.deleteSpotlightHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      spotId,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
  }

  @Get('startups')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_READ)
  async listStartups(@Query() query: AdminSearchPaginationDto) {
    const { items, total } = await this.listStartupsHandler.execute({
      skip: query.skip ?? 0,
      take: query.take ?? 20,
      search: query.search,
    });
    return { success: true, data: items, total };
  }

  @Get('startups/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_READ)
  async getStartup(@Param('id') startupId: string) {
    const startup = await this.getStartupHandler.execute({ startupId });
    return { success: true, data: startup };
  }

  @Delete('startups/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStartup(
    @Req() req: FastifyAdminRequest,
    @Param('id') startupId: string,
  ) {
    await this.deleteStartupHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      startupId,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
  }

  @Get('admin-users')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  async listAdminUsers(@Query() query: AdminPaginationDto) {
    const { items, total } = await this.listAdminUsersHandler.execute({
      skip: query.skip ?? 0,
      take: query.take ?? 20,
    });
    return { success: true, data: items, total };
  }

  @Get('roles')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  async listRoles() {
    const roles = await this.listRolesHandler.execute();
    return { success: true, data: roles };
  }

  @Patch('admin-users/:id/role')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  async setAdminRole(
    @Req() req: FastifyAdminRequest,
    @Param('id') adminUserId: string,
    @Body() body: AdminUpdateRoleDto,
  ) {
    const updated = await this.updateAdminRoleHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      targetAdminUserId: adminUserId,
      roleKey: body.roleKey,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: updated };
  }

  @Patch('admin-users/:id/superadmin')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  async setSuperAdmin(
    @Req() req: FastifyAdminRequest,
    @Param('id') adminUserId: string,
    @Body() body: AdminToggleSuperAdminDto,
  ) {
    const updated = await this.setSuperAdminHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      targetAdminUserId: adminUserId,
      isSuperAdmin: body.isSuperAdmin,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: updated };
  }

  @Patch('admin-users/:id/status')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  async setAdminStatus(
    @Req() req: FastifyAdminRequest,
    @Param('id') adminUserId: string,
    @Body() body: AdminSetActiveDto,
  ) {
    const updated = await this.setAdminActiveHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      targetAdminUserId: adminUserId,
      isActive: body.isActive,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: updated };
  }

  @Get('invitations')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  async listInvitations(@Query() query: AdminPaginationDto) {
    const { items, total } = await this.listInvitationsHandler.execute({
      skip: query.skip ?? 0,
      take: query.take ?? 20,
    });
    return { success: true, data: items, total };
  }

  @Patch('invitations/:id/revoke')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  async revokeInvitation(
    @Req() req: FastifyAdminRequest,
    @Param('id') invitationId: string,
  ) {
    const invitation = await this.revokeInvitationHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      invitationId,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: invitation };
  }

  @Get('audit-logs/export')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  async exportAuditLogs() {
    const csv = await this.exportAuditLogsHandler.execute();
    return { success: true, data: csv };
  }

  @Get('audit-logs')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  async listAuditLogs(@Query() query: AdminAuditLogsPaginationDto) {
    const { items, total } = await this.listAuditLogsHandler.execute({
      skip: query.skip ?? 0,
      take: query.take ?? 50,
      search: query.search,
      resourceType: query.resourceType,
    });
    return { success: true, data: items, total };
  }

  @Get('audit-logs/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  async getAuditLog(@Param('id') auditLogId: string) {
    const auditLog = await this.getAuditLogHandler.execute({ auditLogId });
    return { success: true, data: auditLog };
  }

  @Get('dashboard')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_READ)
  async dashboardStats() {
    const stats = await this.dashboardStatsHandler.execute();
    return { success: true, data: stats };
  }

  @Get('datarooms')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_USERS_READ)
  async listDatarooms(@Query() query: AdminPaginationDto) {
    const { items, total } = await this.listDataroomsHandler.execute({
      skip: query.skip ?? 0,
      take: query.take ?? 20,
    });
    return { success: true, data: items, total };
  }

  @Patch('posts/:id/hide')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async hidePost(
    @Req() req: FastifyAdminRequest,
    @Param('id') postId: string,
    @Body() body: AdminHideDto,
  ) {
    const result = await this.hidePostHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      postId,
      isHidden: body.isHidden,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Patch('discussions/:id/hide')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async hideDiscussion(
    @Req() req: FastifyAdminRequest,
    @Param('id') discussionId: string,
    @Body() body: AdminHideDto,
  ) {
    const result = await this.hideDiscussionHandler.execute({
      transactionId: req.id,
      actorAdminUserId: req.adminUserId,
      discussionId,
      isHidden: body.isHidden,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  // ─── Reports ────────────────────────────────────────────────

  @Get('reports')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async listReports(@Query() query: AdminSearchPaginationDto) {
    const { data, total } = await this.reportService.list({
      transactionId: 'admin',
      skip: query.skip ?? 0,
      take: query.take ?? 20,
      status: query.search,
    });
    return { success: true, data, total };
  }

  @Get('reports/count')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async countReports() {
    const count = await this.reportService.countPending();
    return { success: true, data: { count } };
  }

  @Get('reports/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async getReport(@Param('id') reportId: string) {
    const report = await this.reportService.findById({ transactionId: 'admin', reportId });
    if (!report) throw new NotFoundException('Report not found');
    return { success: true, data: report };
  }

  @Patch('reports/:id/resolve')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  @HttpCode(HttpStatus.OK)
  async resolveReport(
    @Req() req: FastifyAdminRequest,
    @Param('id') reportId: string,
  ) {
    const existing = await this.reportService.findById({
      transactionId: req.id,
      reportId,
    });
    const result = await this.reportService.updateStatus({
      transactionId: req.id,
      reportId,
      status: 'RESOLVED',
    });
    await this.adminService.createAuditLog({
      adminUserId: req.adminUserId,
      action: 'admin.report.resolve',
      resourceType: 'report',
      resourceId: reportId,
      metadata: {
        transactionId: req.id,
        previousStatus: existing?.status,
        status: result.status,
        reason: existing?.reason,
        reportedResourceType: existing?.resourceType,
        reportedResourceId: existing?.resourceId,
      },
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Patch('reports/:id/dismiss')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  @HttpCode(HttpStatus.OK)
  async dismissReport(
    @Req() req: FastifyAdminRequest,
    @Param('id') reportId: string,
  ) {
    const existing = await this.reportService.findById({
      transactionId: req.id,
      reportId,
    });
    const result = await this.reportService.updateStatus({
      transactionId: req.id,
      reportId,
      status: 'DISMISSED',
    });
    await this.adminService.createAuditLog({
      adminUserId: req.adminUserId,
      action: 'admin.report.dismiss',
      resourceType: 'report',
      resourceId: reportId,
      metadata: {
        transactionId: req.id,
        previousStatus: existing?.status,
        status: result.status,
        reason: existing?.reason,
        reportedResourceType: existing?.resourceType,
        reportedResourceId: existing?.resourceId,
      },
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  // ─── Feedback ───────────────────────────────────────────────

  @Get('feedback')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async listFeedback(@Query() query: AdminSearchPaginationDto) {
    const { data, total } = await this.feedbackService.list({
      transactionId: 'admin',
      skip: query.skip ?? 0,
      take: query.take ?? 20,
      status: query.search,
    });
    return { success: true, data, total };
  }

  @Get('feedback/count')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async countFeedback() {
    const count = await this.feedbackService.countPending();
    return { success: true, data: { count } };
  }

  @Get('feedback/:id')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  async getFeedback(@Param('id') feedbackId: string) {
    const feedback = await this.feedbackService.findById({ transactionId: 'admin', feedbackId });
    if (!feedback) throw new NotFoundException('Feedback not found');
    return { success: true, data: feedback };
  }

  @Patch('feedback/:id/resolve')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  @HttpCode(HttpStatus.OK)
  async resolveFeedback(
    @Req() req: FastifyAdminRequest,
    @Param('id') feedbackId: string,
  ) {
    const existing = await this.feedbackService.findById({
      transactionId: req.id,
      feedbackId,
    });
    const result = await this.feedbackService.updateStatus({
      transactionId: req.id,
      feedbackId,
      status: 'RESOLVED',
    });
    await this.adminService.createAuditLog({
      adminUserId: req.adminUserId,
      action: 'admin.feedback.resolve',
      resourceType: 'feedback',
      resourceId: feedbackId,
      metadata: {
        transactionId: req.id,
        previousStatus: existing?.status,
        status: result.status,
        type: existing?.type,
      },
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }

  @Patch('feedback/:id/dismiss')
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_CONTENT_MODERATE)
  @HttpCode(HttpStatus.OK)
  async dismissFeedback(
    @Req() req: FastifyAdminRequest,
    @Param('id') feedbackId: string,
  ) {
    const existing = await this.feedbackService.findById({
      transactionId: req.id,
      feedbackId,
    });
    const result = await this.feedbackService.updateStatus({
      transactionId: req.id,
      feedbackId,
      status: 'DISMISSED',
    });
    await this.adminService.createAuditLog({
      adminUserId: req.adminUserId,
      action: 'admin.feedback.dismiss',
      resourceType: 'feedback',
      resourceId: feedbackId,
      metadata: {
        transactionId: req.id,
        previousStatus: existing?.status,
        status: result.status,
        type: existing?.type,
      },
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: result };
  }
}
