import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class CategoryCreateException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryCreateException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('Category creation failed', context);
    throw new CategoryCreateException('Failed to create category');
  }
}

export class CategoryUpdateException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryUpdateException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('Category update failed', context);
    throw new CategoryUpdateException('Failed to update category');
  }
}

export class CategoryDeleteException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryDeleteException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('Category deletion failed', context);
    throw new CategoryDeleteException('Failed to delete category');
  }
}

export class CategoryListException extends InternalServerErrorException {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryListException';
  }

  static throw(
    logger: LogService,
    context: { transactionId: string; error: any },
  ) {
    logger.error('Category listing failed', context);
    throw new CategoryListException('Failed to list categories');
  }
}

export class CategoryNotFoundException extends NotFoundException {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryNotFoundException';
  }

  static throw(logger: LogService, context: { transactionId: string }) {
    logger.error('Category not found', context);
    throw new CategoryNotFoundException('Category not found');
  }
}
