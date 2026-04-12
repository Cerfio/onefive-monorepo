import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { BaseLoggedException } from 'src/common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class EmailVerificationCreateException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class EmailVerificationGetException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class EmailVerificationBadCodeException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class EmailVerificationCodeExpiredException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class EmailVerificationCooldownException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  static throw(logger: LogService, args: any): never {
    logger.error('Email verification: cooldown active', args);
    throw new EmailVerificationCooldownException(
      `Please wait ${args.retryAfter || 60} seconds before requesting a new code`,
    );
  }
}
