import {
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class DataroomCommentCreateException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'DataroomCommentCreateException';
  }

  static throw(logger: LogService, context: { error: any }) {
    logger.error('Dataroom comment creation failed', context);
    throw new DataroomCommentCreateException('Failed to create comment');
  }
}

export class DataroomCommentListException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'DataroomCommentListException';
  }

  static throw(logger: LogService, context: { error: any }) {
    logger.error('Dataroom comment listing failed', context);
    throw new DataroomCommentListException('Failed to list comments');
  }
}

export class DataroomCommentNotFoundException extends NotFoundException {
  constructor() {
    super('Comment not found');
    this.name = 'DataroomCommentNotFoundException';
  }
}

export class DataroomCommentForbiddenException extends ForbiddenException {
  constructor(message = 'You do not have permission to perform this action') {
    super(message);
    this.name = 'DataroomCommentForbiddenException';
  }
}
