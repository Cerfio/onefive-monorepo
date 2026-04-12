import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

@Injectable()
export class ReportCreateException extends InternalServerErrorException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(errorMessage);
    logger.error(errorMessage, { ...args });
  }

  static create(logger: LogService, args: object) {
    return new this(logger, args, this.name);
  }

  static throw(logger: LogService, args: object): never {
    throw this.create(logger, args);
  }
}

@Injectable()
export class ReportDuplicateException extends BadRequestException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(errorMessage);
    logger.warn(errorMessage, { ...args });
  }

  static create(logger: LogService, args: object) {
    return new this(logger, args, 'You have already reported this content');
  }

  static throw(logger: LogService, args: object): never {
    throw this.create(logger, args);
  }
}
