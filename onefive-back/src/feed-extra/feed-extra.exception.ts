import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class FeedExtraGetException extends InternalServerErrorException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(FeedExtraGetException.name);
    logger.error(FeedExtraGetException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new FeedExtraGetException(logger, transactionId, error);
  }
}

export class FeedExtraCreateException extends InternalServerErrorException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(FeedExtraCreateException.name);
    logger.error(FeedExtraCreateException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new FeedExtraCreateException(logger, transactionId, error);
  }
}

export class FeedExtraValidationException extends BadRequestException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(FeedExtraValidationException.name);
    logger.error(FeedExtraValidationException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new FeedExtraValidationException(logger, transactionId, error);
  }
}

export class FeedExtraNotFoundException extends NotFoundException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(FeedExtraNotFoundException.name);
    logger.error(FeedExtraNotFoundException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new FeedExtraNotFoundException(logger, transactionId, error);
  }
}
