import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard that verifies the authenticated user is a member of the dataroom
 * AND has admin-level permissions (hasAllAccess, e.g. Founder group).
 *
 * Must be used AFTER SessionGuard to ensure req.userId is populated.
 */
@Injectable()
export class DataroomOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.userId;
    const dataroomId = request.params?.dataroomId;

    if (!dataroomId) {
      return true;
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new ForbiddenException('Profile not found');
    }

    const member = await this.prisma.member.findFirst({
      where: {
        profileId: profile.id,
        dataroomId,
      },
      include: {
        group: true,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this dataroom');
    }

    if (!member.group?.hasAllAccess) {
      throw new ForbiddenException(
        'You do not have admin permissions on this dataroom',
      );
    }

    request.dataroomMember = member;

    return true;
  }
}
