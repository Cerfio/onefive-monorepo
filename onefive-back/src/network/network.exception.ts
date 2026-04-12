import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BaseLoggedException } from '../common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class NetworkCreateException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new NetworkCreateException(
      logger,
      args,
      message || 'Failed to create network connection',
    );
  }
}

export class NetworkGetException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new NetworkGetException(
      logger,
      args,
      message || 'Failed to retrieve network data',
    );
  }
}

export class NetworkValidationException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new NetworkValidationException(
      logger,
      args,
      message || 'Invalid network request parameters',
    );
  }
}

export class NetworkNotFoundException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(NotFoundException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new NetworkNotFoundException(
      logger,
      args,
      message || 'Network resource not found',
    );
  }
}

export class NetworkAlreadyExistsException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }

  static throw(logger: LogService, args: object, message?: string): never {
    throw new NetworkAlreadyExistsException(
      logger,
      args,
      message || 'Network connection or request already exists',
    );
  }
}
