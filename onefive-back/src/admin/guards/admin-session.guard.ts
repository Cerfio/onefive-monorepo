import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { FastifyAdminRequest } from '../admin-request.type';
import { ADMIN_COOKIE_NAME } from '../admin.constants';

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly adminService: AdminService) {}

  private extractAdminTokenFromCookie(cookieHeader: string | undefined): string {
    if (!cookieHeader) {
      throw new UnauthorizedException('Missing admin cookie');
    }

    const cookieArray = cookieHeader.split(';').map((cookie) => cookie.trim());
    const fullToken = cookieArray.find((cookie) =>
      cookie.startsWith(`${ADMIN_COOKIE_NAME}=`),
    );

    if (!fullToken) {
      throw new UnauthorizedException('Missing admin token');
    }

    return fullToken.slice(`${ADMIN_COOKIE_NAME}=`.length);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<FastifyAdminRequest>();
    const token = this.extractAdminTokenFromCookie(request.headers.cookie);
    const validated = await this.adminService.validateAdminToken(token);

    request.adminUserId = validated.adminUser.id;
    request.adminToken = token;
    request.adminPermissions = validated.permissions;
    request.isSuperAdmin = validated.adminUser.isSuperAdmin;

    return true;
  }
}
