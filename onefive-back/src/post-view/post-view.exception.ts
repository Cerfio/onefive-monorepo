import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

@Injectable()
export class PostViewCreateException extends InternalServerErrorException {
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
