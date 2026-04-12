import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BaseLoggedException } from 'src/common/exceptions/base.exeption';
import { LogService } from 'logstash-winston-3';

export class StorageUploadException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class StorageGetException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class StorageDeleteException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class StorageSignUrlException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(InternalServerErrorException, logger, args, errorMessage);
  }
}

export class StorageFileNotFoundException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(NotFoundException, logger, args, errorMessage);
  }
}

export class StorageInvalidFileException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class StorageFileSizeException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}

export class StorageMimeTypeException extends BaseLoggedException {
  constructor(logger: LogService, args: object, errorMessage: string) {
    super(BadRequestException, logger, args, errorMessage);
  }
}
