import {
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { BaseLoggedException } from 'src/common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class PrismaConnectionException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class PrismaQueryException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class PrismaTransactionException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class PrismaValidationException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class PrismaUniqueConstraintException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class PrismaForeignKeyConstraintException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}
