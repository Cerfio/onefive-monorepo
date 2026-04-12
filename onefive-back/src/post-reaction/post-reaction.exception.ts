import { InternalServerErrorException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class PostReactionException extends InternalServerErrorException {
  constructor(
    private readonly logger: LogService,
    private readonly context: any,
    message: string,
  ) {
    super(message);
    this.name = 'PostReactionException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostReactionException(
      logger,
      context,
      message || 'Post reaction error',
    );
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostReactionCreateException extends PostReactionException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to create post reaction');
    this.name = 'PostReactionCreateException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostReactionCreateException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostReactionGetException extends PostReactionException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to get post reaction');
    this.name = 'PostReactionGetException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostReactionGetException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostReactionListException extends PostReactionException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to list post reactions');
    this.name = 'PostReactionListException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostReactionListException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostReactionUpdateException extends PostReactionException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to update post reaction');
    this.name = 'PostReactionUpdateException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostReactionUpdateException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostReactionDeleteException extends PostReactionException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to delete post reaction');
    this.name = 'PostReactionDeleteException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostReactionDeleteException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}
