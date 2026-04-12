import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class ProfileSuggestionGetException extends InternalServerErrorException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(ProfileSuggestionGetException.name);
    logger.error(ProfileSuggestionGetException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new ProfileSuggestionGetException(logger, transactionId, error);
  }
}

export class ProfileSuggestionCreateException extends InternalServerErrorException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(ProfileSuggestionCreateException.name);
    logger.error(ProfileSuggestionCreateException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new ProfileSuggestionCreateException(logger, transactionId, error);
  }
}

export class ProfileSuggestionNotFoundException extends NotFoundException {
  constructor(logger: LogService, transactionId: string, ...args: unknown[]) {
    super(ProfileSuggestionNotFoundException.name);
    logger.error(ProfileSuggestionNotFoundException.name, {
      transactionId,
      ...args,
    });
  }
  static throw(
    logger: LogService,
    { transactionId, error }: { transactionId: string; error?: unknown },
  ) {
    throw new ProfileSuggestionNotFoundException(logger, transactionId, error);
  }
}
