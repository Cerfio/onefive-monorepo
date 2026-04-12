import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ALLOW_WAITLIST_NOT_ACTIVE_KEY } from '../decorators/allow-waitlist-not-active.decorator';
import { SKIP_WAITLIST_CHECK_KEY } from '../decorators/skip-waitlist-check.decorator';

type RequestWithProfileCache = {
  userId?: string;
  _profile?: {
    waitlistStatus: 'ACTIVE' | 'WAITING' | 'IGNORED';
  } | null;
};

@Injectable()
export class WaitlistGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip if @Public() route (no auth = no waitlist check)
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const allowWaitlistNotActive = this.reflector.getAllAndOverride<boolean>(
      ALLOW_WAITLIST_NOT_ACTIVE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowWaitlistNotActive) {
      return true;
    }

    // Backward compatibility for old decorator usage
    const skipWaitlist = this.reflector.getAllAndOverride<boolean>(
      SKIP_WAITLIST_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skipWaitlist) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<RequestWithProfileCache>();
    const userId = request.userId;

    // If no userId (not authenticated yet), let SessionGuard handle it
    if (!userId) {
      return true;
    }

    if (request._profile === undefined) {
      request._profile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { waitlistStatus: true },
      });
    }

    // If no profile exists yet (user just signed up), allow access
    // Profile creation routes should have @AllowWaitlistNotActive() or equivalent
    if (!request._profile) {
      return true;
    }

    if (request._profile.waitlistStatus !== 'ACTIVE') {
      throw new ForbiddenException(
        'Your account is on the waitlist. Access will be granted once you are approved.',
      );
    }

    return true;
  }
}
