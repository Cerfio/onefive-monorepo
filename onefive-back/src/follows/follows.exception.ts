import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BaseLoggedException } from '../common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class FollowsCreateException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new FollowsCreateException(
      logger,
      args,
      message || 'Failed to create follow relationship',
    );
  }
}

export class FollowsGetException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new FollowsGetException(
      logger,
      args,
      message || 'Failed to get follow relationships',
    );
  }
}

export class FollowsDeleteException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new FollowsDeleteException(
      logger,
      args,
      message || 'Failed to delete follow relationship',
    );
  }
}

export class FollowsValidationException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new FollowsValidationException(
      logger,
      args,
      message || 'Validation failed',
    );
  }
}

export class FollowsNotFoundException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(NotFoundException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new FollowsNotFoundException(
      logger,
      args,
      message || 'Follow relationship not found',
    );
  }
}

export class FollowsAlreadyExistsException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new FollowsAlreadyExistsException(
      logger,
      args,
      message || 'Follow relationship already exists',
    );
  }
}
