import { InternalServerErrorException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class PostException extends InternalServerErrorException {
  constructor(
    private readonly logger: LogService,
    private readonly context: any,
    message: string,
  ) {
    super(message);
    this.name = 'PostException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostException(
      logger,
      context,
      message || 'Post error',
    );
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostCreateException extends PostException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to create post');
    this.name = 'PostCreateException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostCreateException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostGetException extends PostException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to get post');
    this.name = 'PostGetException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostGetException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostListException extends PostException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to list posts');
    this.name = 'PostListException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostListException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostUpdateException extends PostException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to update post');
    this.name = 'PostUpdateException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostUpdateException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostDeleteException extends PostException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to delete post');
    this.name = 'PostDeleteException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostDeleteException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}
