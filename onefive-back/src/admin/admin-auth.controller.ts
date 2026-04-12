import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Public } from 'src/common/decorators/public.decorator';
import { FastifyAdminRequest } from './admin-request.type';
import {
  AdminAcceptInvitationDto,
  AdminCreateInvitationDto,
  AdminSigninDto,
} from './dto/admin-auth.dto';
import { AdminSigninHandler } from './handlers/admin-signin.handler';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { AdminPermissionGuard } from './guards/admin-permission.guard';
import { RequireAdminPermissions } from './admin.decorators';
import { ADMIN_PERMISSIONS } from './admin.constants';
import { setAdminAuthCookie, clearAdminAuthCookie } from './admin-cookie.utils';
import { AdminLogoutHandler } from './handlers/admin-logout.handler';
import { AdminCreateInvitationHandler } from './handlers/admin-create-invitation.handler';
import { AdminAcceptInvitationHandler } from './handlers/admin-accept-invitation.handler';
import { AdminUpdateProfileHandler } from './handlers/admin-update-profile.handler';
import { AdminUpdateProfileDto } from './dto/admin-profile.dto';
import { AdminService } from './admin.service';

@Public()
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly signinHandler: AdminSigninHandler,
    private readonly logoutHandler: AdminLogoutHandler,
    private readonly createInvitationHandler: AdminCreateInvitationHandler,
    private readonly acceptInvitationHandler: AdminAcceptInvitationHandler,
    private readonly updateProfileHandler: AdminUpdateProfileHandler,
    private readonly adminService: AdminService,
  ) {}

  private getUserAgent(req: FastifyAdminRequest): string | undefined {
    const userAgent = req.headers['user-agent'];
    if (Array.isArray(userAgent)) {
      return userAgent[0];
    }
    return userAgent;
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Req() req: FastifyAdminRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() body: AdminSigninDto,
  ) {
    const payload = await this.signinHandler.execute({
      transactionId: req.id,
      email: body.email,
      password: body.password,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });

    const ttlSeconds = Math.floor(
      (payload.expiresAt.getTime() - Date.now()) / 1000,
    );
    setAdminAuthCookie(reply, payload.token, ttlSeconds);

    return {
      success: true,
      data: payload.admin,
    };
  }

  @Public()
  @Post('accept-invitation')
  @HttpCode(HttpStatus.CREATED)
  async acceptInvitation(
    @Req() req: FastifyAdminRequest,
    @Body() body: AdminAcceptInvitationDto,
  ) {
    const admin = await this.acceptInvitationHandler.execute({
      transactionId: req.id,
      token: body.token,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });

    return {
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
      },
    };
  }

  @Post('logout')
  @UseGuards(AdminSessionGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: FastifyAdminRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.logoutHandler.execute({
      transactionId: req.id,
      adminUserId: req.adminUserId,
      token: req.adminToken,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    clearAdminAuthCookie(reply);
  }

  @Get('me')
  @UseGuards(AdminSessionGuard)
  async me(@Req() req: FastifyAdminRequest) {
    const admin = await this.adminService.getAdminUserById(req.adminUserId);

    return {
      success: true,
      data: {
        id: req.adminUserId,
        isSuperAdmin: req.isSuperAdmin,
        permissions: req.adminPermissions,
        email: admin?.email,
        firstName: admin?.firstName ?? null,
        lastName: admin?.lastName ?? null,
        fullName: admin
          ? `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim()
          : '',
      },
    };
  }

  @Patch('me')
  @UseGuards(AdminSessionGuard)
  async updateMe(
    @Req() req: FastifyAdminRequest,
    @Body() body: AdminUpdateProfileDto,
  ) {
    const updated = await this.updateProfileHandler.execute({
      transactionId: req.id,
      adminUserId: req.adminUserId,
      firstName: body.firstName,
      lastName: body.lastName,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });
    return { success: true, data: updated };
  }

  @Post('invitations')
  @UseGuards(AdminSessionGuard, AdminPermissionGuard)
  @RequireAdminPermissions(ADMIN_PERMISSIONS.ADMIN_ADMINS_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  async createInvitation(
    @Req() req: FastifyAdminRequest,
    @Body() body: AdminCreateInvitationDto,
  ) {
    const invitation = await this.createInvitationHandler.execute({
      transactionId: req.id,
      adminUserId: req.adminUserId,
      email: body.email,
      roleKey: body.roleKey,
      ipAddress: req.ip,
      userAgent: this.getUserAgent(req),
    });

    return {
      success: true,
      data: invitation,
    };
  }
}
