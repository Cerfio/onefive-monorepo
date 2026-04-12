import {
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseLoggedException } from 'src/common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class PasswordResetCreateException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class PasswordResetNotFoundException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(NotFoundException, logger, args, errorMessage);
  }
}

export class AuthenticationPasswordResetBadCodeBadRequestException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class AuthenticationPasswordResetCodeExpiredBadRequestException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class AuthenticationPasswordResetInvalidTokenBadRequestException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class AuthenticationPasswordResetPasswordsDoNotMatchBadRequestException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class PasswordResetTooManyRequestsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  static throw(logger: LogService, args: any) {
    logger.error('Password reset: too many requests', args);
    throw new PasswordResetTooManyRequestsException(
      args.message || 'Please wait before requesting another reset code',
    );
  }
}

export class PasswordResetTooManyAttemptsException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  static throw(logger: LogService, args: any) {
    logger.error('Password reset: too many verification attempts', args);
    throw new PasswordResetTooManyAttemptsException(
      args.message || 'Too many attempts. Please request a new reset code.',
    );
  }
}
