import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard that verifies the authenticated user is a member of the dataroom
 * specified in the route params (:dataroomId).
 *
 * Must be used AFTER SessionGuard to ensure req.userId is populated.
 * Attaches the member (with group) to request.dataroomMember for downstream use.
 */
@Injectable()
export class DataroomMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.userId;
    const dataroomId = request.params?.dataroomId;

    if (!dataroomId) {
      // No dataroomId in params — skip membership check
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

    // Attach member info to request for downstream handlers
    request.dataroomMember = member;

    return true;
  }
}
