import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class SignedUrlGetException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'SignedUrlGetException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('Signed URL retrieval failed', context);
    throw new SignedUrlGetException('Failed to get signed URL');
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
