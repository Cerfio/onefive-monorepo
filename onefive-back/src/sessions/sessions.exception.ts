import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseLoggedException } from 'src/common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class CreateSessionException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class GetSessionException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class UpdateSessionException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class DeleteSessionException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class SessionNotFoundException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(NotFoundException, logger, args, errorMessage);
  }
}

export class SessionAlreadyExistsException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(ConflictException, logger, args, errorMessage);
  }
}

export class InvalidSessionException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class SessionRevokedException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(ForbiddenException, logger, args, errorMessage);
  }
}

export class SessionExpiredException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(UnauthorizedException, logger, args, errorMessage);
  }
}

export class SessionCannotRevokeCurrentException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}
