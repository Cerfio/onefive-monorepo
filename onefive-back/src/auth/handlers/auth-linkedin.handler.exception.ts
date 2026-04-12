import {
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { BaseLoggedException } from 'src/common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class AuthLinkedinHandlerException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class AuthLinkedinHandlerValidationException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}
