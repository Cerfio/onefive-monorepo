import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseLoggedException } from 'src/common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class SmsVerificationCreateException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class SmsVerificationGetException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class SmsVerificationFindManyException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class SmsVerificationDeleteException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class SmsVerificationSendException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class SmsVerificationNotFoundException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(NotFoundException, logger, args, errorMessage);
  }
}

export class SmsVerificationCodeExpiredException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class SmsVerificationIncorrectCodeException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class SmsVerificationAlreadyVerifiedException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(ConflictException, logger, args, errorMessage);
  }
}

export class SmsVerificationPhoneNumberInvalidException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class SmsVerificationPhoneNumberAlreadyUsedException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(ConflictException, logger, args, errorMessage);
  }
}

export class SmsVerificationCooldownException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  static throw(logger: LogService, args: any): never {
    logger.error('SMS verification: cooldown active', args);
    throw new SmsVerificationCooldownException(
      `Please wait ${args.retryAfter || 60} seconds before requesting a new code`,
    );
  }
}
