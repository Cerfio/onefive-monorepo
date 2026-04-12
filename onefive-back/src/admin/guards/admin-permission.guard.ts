import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyAdminRequest } from '../admin-request.type';
import { ADMIN_PERMISSION_METADATA_KEY } from '../admin.decorators';

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      ADMIN_PERMISSION_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyAdminRequest>();
    if (request.isSuperAdmin) {
      return true;
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      request.adminPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Missing admin permission');
    }

    return true;
  }
}
