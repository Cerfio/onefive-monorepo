import { UnauthorizedException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class TokenUnauthorizedException extends UnauthorizedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(errorMessage);
    logger.error(errorMessage, {
      ...args,
    });
  }

  static create(logger: LogService, args: object) {
    return new this(logger, args, this.name);
  }

  static throw(logger: LogService, args: object): never {
    throw this.create(logger, args);
  }
}
