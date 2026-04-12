import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

@Injectable()
export class DiscussionCreateException extends InternalServerErrorException {
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
export class DiscussionNotFoundException extends NotFoundException {
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
export class DiscussionGetException extends InternalServerErrorException {
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
export class DiscussionListException extends InternalServerErrorException {
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
export class DiscussionUpdateException extends InternalServerErrorException {
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
export class DiscussionDeleteException extends InternalServerErrorException {
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
export class DiscussionUpdateForbiddenException extends ForbiddenException {
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
