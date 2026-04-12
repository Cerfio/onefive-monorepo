import { HttpException, HttpStatus } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

interface ExceptionContext {
  transactionId: string;
  [key: string]: any;
}

export class MessagingException {
  static throw(
    logger: LogService,
    context: ExceptionContext,
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    logger.error({
      transactionId: context.transactionId,
      message,
      ...context,
    });
    throw new HttpException(message, status);
  }
}

export class ConversationNotFoundException {
  static throw(logger: LogService, context: ExceptionContext) {
    MessagingException.throw(
      logger,
      context,
      'Conversation not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class MessageNotFoundException {
  static throw(logger: LogService, context: ExceptionContext) {
    MessagingException.throw(
      logger,
      context,
      'Message not found',
      HttpStatus.NOT_FOUND,
    );
  }
}

export class UnauthorizedConversationAccessException {
  static throw(logger: LogService, context: ExceptionContext) {
    MessagingException.throw(
      logger,
      context,
      'You are not a member of this conversation',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class UnauthorizedMessageEditException {
  static throw(logger: LogService, context: ExceptionContext) {
    MessagingException.throw(
      logger,
      context,
      'You can only edit your own messages',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ConversationAlreadyExistsException {
  static throw(logger: LogService, context: ExceptionContext) {
    MessagingException.throw(
      logger,
      context,
      'A conversation with this participant already exists',
      HttpStatus.CONFLICT,
    );
  }
}

export class MessagingCreateException {
  static throw(logger: LogService, context: ExceptionContext) {
    MessagingException.throw(
      logger,
      context,
      'Failed to create messaging resource',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class MessagingGetException {
  static throw(logger: LogService, context: ExceptionContext) {
    MessagingException.throw(
      logger,
      context,
      'Failed to retrieve messaging data',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class MessagingUpdateException {
  static throw(logger: LogService, context: ExceptionContext) {
    MessagingException.throw(
      logger,
      context,
      'Failed to update messaging resource',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class MessagingDeleteException {
  static throw(logger: LogService, context: ExceptionContext) {
    MessagingException.throw(
      logger,
      context,
      'Failed to delete messaging resource',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
