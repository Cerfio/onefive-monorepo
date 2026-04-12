import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from 'src/prisma/prisma.service';
import { ALLOW_ONBOARDING_NOT_COMPLETE_KEY } from '../decorators/allow-onboarding-not-complete.decorator';
import { ProfileOnboardingNotCompletedException } from 'src/profile/profile.exception';

type CachedProfile = {
  id: string;
  waitlistStatus: 'ACTIVE' | 'WAITING' | 'IGNORED';
};

type RequestWithProfileCache = {
  userId?: string;
  transactionId?: string;
  _profile?: CachedProfile | null;
};

@Injectable()
export class OnboardingCompleteGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const allowOnboardingNotComplete =
      this.reflector.getAllAndOverride<boolean>(
        ALLOW_ONBOARDING_NOT_COMPLETE_KEY,
        [context.getHandler(), context.getClass()],
      );
    if (allowOnboardingNotComplete) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<RequestWithProfileCache>();
    if (!request.userId) {
      return true;
    }

    if (request._profile === undefined) {
      request._profile = await this.prisma.profile.findUnique({
        where: { userId: request.userId },
        select: {
          id: true,
          waitlistStatus: true,
        },
      });
    }

    if (!request._profile) {
      throw new ProfileOnboardingNotCompletedException(
        this.logger,
        request.transactionId ?? 'unknown',
      );
    }

    return true;
  }
}
