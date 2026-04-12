import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.userId ?? request.user?.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // Vérifier si l'utilisateur a un profil avec des rôles admin
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { roles: true },
    });

    if (!profile) {
      throw new ForbiddenException('Profile not found');
    }

    // Vérifier si l'utilisateur a un rôle admin
    const hasAdminRole = profile.roles.some(
      (role) => role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'OWNER',
    );

    if (!hasAdminRole) {
      throw new ForbiddenException('Admin role required');
    }

    return true;
  }
}
