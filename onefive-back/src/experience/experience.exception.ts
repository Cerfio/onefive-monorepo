import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseLoggedException } from 'src/common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class ExperienceCreateException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class ExperienceUpdateException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class ExperienceGetException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class ExperienceValidationException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class ExperienceNotFoundException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(NotFoundException, logger, args, errorMessage);
  }
}

export class ExperienceUnauthorizedException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(UnauthorizedException, logger, args, errorMessage);
  }
}
