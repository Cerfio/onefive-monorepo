import { CanActivate, ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from 'src/prisma/prisma.service';
import { ALLOW_EMAIL_NOT_VERIFIED_KEY } from '../decorators/allow-email-not-verified.decorator';
import { ProfileEmailNotVerifiedException } from 'src/profile/profile.exception';

type CachedUser = {
  id: string;
  isEmailVerified: boolean;
};

type RequestWithAuthCache = {
  userId?: string;
  transactionId?: string;
  _user?: CachedUser | null;
};

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
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

    const allowEmailNotVerified = this.reflector.getAllAndOverride<boolean>(
      ALLOW_EMAIL_NOT_VERIFIED_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowEmailNotVerified) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuthCache>();
    if (!request.userId) {
      return true;
    }

    if (!request._user) {
      request._user = await this.prisma.user.findUnique({
        where: { id: request.userId },
        select: { id: true, isEmailVerified: true },
      });
    }

    if (!request._user || request._user.isEmailVerified !== true) {
      throw new ProfileEmailNotVerifiedException(
        this.logger,
        request.transactionId ?? 'unknown',
      );
    }

    return true;
  }
}
