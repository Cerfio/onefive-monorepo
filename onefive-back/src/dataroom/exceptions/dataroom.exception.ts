import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class DataroomCreateException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'DataroomCreateException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('Dataroom creation failed', context);
    throw new DataroomCreateException('Failed to create dataroom');
  }
}

export class DataroomGetException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'DataroomGetException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('Dataroom retrieval failed', context);
    throw new DataroomGetException('Failed to retrieve dataroom');
  }
}

export class DataroomDeleteException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'DataroomDeleteException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('Dataroom deletion failed', context);
    throw new DataroomDeleteException('Failed to delete dataroom');
  }
}

export class DataroomListException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'DataroomListException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('Dataroom listing failed', context);
    throw new DataroomListException('Failed to list datarooms');
  }
}

export class DataroomNotFoundException extends NotFoundException {
  constructor(message: string) {
    super(message);
    this.name = 'DataroomNotFoundException';
  }

  static throw(logger: LogService, context: { transactionId: string }) {
    logger.error('Dataroom not found', context);
    throw new DataroomNotFoundException('Dataroom not found');
  }
}
