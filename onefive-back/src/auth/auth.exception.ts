import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseLoggedException } from 'src/common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class AuthenticationBadPasswordException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(UnauthorizedException, logger, args, errorMessage);
  }
}

export class AuthenticationLinkedinEmailNotVerifiedException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class AuthenticationEmailNotVerifiedException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class AuthenticationEmailAlreadyExistException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(ConflictException, logger, args, errorMessage);
  }
}

export class AuthenticationCreateException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class AuthenticationGetException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class AuthenticationNotFoundException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(UnauthorizedException, logger, args, errorMessage);
  }
}

export class AuthenticationUpdateException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}
