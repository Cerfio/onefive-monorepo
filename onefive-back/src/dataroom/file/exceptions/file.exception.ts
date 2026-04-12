import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class FileCreateException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'FileCreateException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('File creation failed', context);
    throw new FileCreateException('Failed to create file');
  }
}

export class FileGetException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'FileGetException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('File retrieval failed', context);
    throw new FileGetException('Failed to retrieve file');
  }
}

export class FileDeleteException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'FileDeleteException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('File deletion failed', context);
    throw new FileDeleteException('Failed to delete file');
  }
}

export class FileListException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'FileListException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('File listing failed', context);
    throw new FileListException('Failed to list files');
  }
}

export class FileNotFoundException extends NotFoundException {
  constructor(message: string) {
    super(message);
    this.name = 'FileNotFoundException';
  }

  static throw(logger: LogService, context: { transactionId: string }) {
    logger.error('File not found', context);
    throw new FileNotFoundException('File not found');
  }
}

export class FileUpdateException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'FileUpdateException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('File update failed', context);
    throw new FileUpdateException('Failed to update file');
  }
}
