import { InternalServerErrorException } from '@nestjs/common';
import { BaseLoggedException } from 'src/common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class FileCreateException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage?: string) {
    super(
      InternalServerErrorException,
      logger,
      args,
      errorMessage || 'Failed to create file entry in database',
    );
  }
}

export class FileGetException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage?: string) {
    super(
      InternalServerErrorException,
      logger,
      args,
      errorMessage || 'Failed to retrieve file from database',
    );
  }
}

export class FileDeleteException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage?: string) {
    super(
      InternalServerErrorException,
      logger,
      args,
      errorMessage || 'Failed to delete file from database',
    );
  }
}
