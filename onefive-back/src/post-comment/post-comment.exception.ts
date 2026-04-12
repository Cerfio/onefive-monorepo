import { InternalServerErrorException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class PostCommentException extends InternalServerErrorException {
  constructor(
    private readonly logger: LogService,
    private readonly context: any,
    message: string,
  ) {
    super(message);
    this.name = 'PostCommentException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostCommentException(
      logger,
      context,
      message || 'Post comment error',
    );
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostCommentCreateException extends PostCommentException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to create post comment');
    this.name = 'PostCommentCreateException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostCommentCreateException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostCommentGetException extends PostCommentException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to get post comment');
    this.name = 'PostCommentGetException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostCommentGetException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostCommentListException extends PostCommentException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to list post comments');
    this.name = 'PostCommentListException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostCommentListException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostCommentUpdateException extends PostCommentException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to update post comment');
    this.name = 'PostCommentUpdateException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostCommentUpdateException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class PostCommentDeleteException extends PostCommentException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to delete post comment');
    this.name = 'PostCommentDeleteException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new PostCommentDeleteException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}
