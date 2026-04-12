import { InternalServerErrorException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class SearchException extends InternalServerErrorException {
  constructor(
    private readonly logger: LogService,
    private readonly context: any,
    message: string,
  ) {
    super(message);
    this.name = 'SearchException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new SearchException(
      logger,
      context,
      message || 'Search error',
    );
    logger.error(exception.message, context);
    throw exception;
  }
}

export class SearchBarException extends SearchException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to search in searchbar');
    this.name = 'SearchBarException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new SearchBarException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class SearchFullException extends SearchException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to perform full search');
    this.name = 'SearchFullException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new SearchFullException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}
