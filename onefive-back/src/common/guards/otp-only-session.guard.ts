import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LogService } from 'logstash-winston-3';
import { ALLOW_OTP_ONLY_SESSION_KEY } from '../decorators/allow-otp-only-session.decorator';
import { OtpOnlySessionRestrictedException } from './otp-only-session.exception';

type RequestWithSession = {
  transactionId?: string;
  session?: {
    isOtpOnlySession?: boolean;
  };
};

@Injectable()
export class OtpOnlySessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
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

    const allowOtpOnlySession = this.reflector.getAllAndOverride<boolean>(
      ALLOW_OTP_ONLY_SESSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowOtpOnlySession) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithSession>();

    if (request.session?.isOtpOnlySession === true) {
      throw new OtpOnlySessionRestrictedException(
        this.logger,
        request.transactionId,
      );
    }

    return true;
  }
}
