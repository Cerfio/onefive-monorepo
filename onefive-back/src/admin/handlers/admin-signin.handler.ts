import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { Log } from 'src/common/logger/logger.decorator';

@Injectable()
export class AdminSigninHandler {
  constructor(private readonly adminService: AdminService) {}

  @Log()
  async execute({
    transactionId,
    email,
    password,
    ipAddress,
    userAgent,
  }: {
    transactionId: string;
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const admin = await this.adminService.getAdminUserByEmail(email);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.adminService.comparePassword(
      password,
      admin.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.adminService.createAdminSession({
      adminUserId: admin.id,
      ipAddress,
      userAgent,
    });
    const roleKeys = admin.roles.map((entry) => entry.role.key);
    const permissions = this.adminService.extractPermissionsFromAdmin(admin);

    await this.adminService.createAuditLog({
      adminUserId: admin.id,
      action: 'admin.auth.signin',
      resourceType: 'admin_user',
      resourceId: admin.id,
      metadata: {
        transactionId,
        email: admin.email,
        roleKeys,
        permissionCount: permissions.length,
        sessionExpiresAt: session.expiresAt,
        sessionTokenSuffix: session.token.slice(-8),
      },
      ipAddress,
      userAgent,
    });

    return {
      token: session.token,
      expiresAt: session.expiresAt,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        isSuperAdmin: admin.isSuperAdmin,
        permissions,
      },
    };
  }
}
