import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

@Injectable()
export class DiscussionAnswerCreateException extends InternalServerErrorException {
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
export class DiscussionAnswerNotFoundException extends NotFoundException {
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
export class DiscussionAnswerUpdateException extends InternalServerErrorException {
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
export class DiscussionAnswerDeleteException extends InternalServerErrorException {
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
export class DiscussionAnswerUpdateForbiddenException extends ForbiddenException {
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
