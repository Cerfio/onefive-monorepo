import { InternalServerErrorException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class StreakException extends InternalServerErrorException {
  constructor(
    private readonly logger: LogService,
    private readonly context: any,
    message: string,
  ) {
    super(message);
    this.name = 'StreakException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new StreakException(
      logger,
      context,
      message || 'Streak error',
    );
    logger.error(exception.message, context);
    throw exception;
  }
}

export class StreakRecordException extends StreakException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to record connection');
    this.name = 'StreakRecordException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new StreakRecordException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}

export class StreakCalculationException extends StreakException {
  constructor(logger: LogService, context: any, message?: string) {
    super(logger, context, message || 'Failed to calculate streak');
    this.name = 'StreakCalculationException';
  }

  static throw(logger: LogService, context: any, message?: string) {
    const exception = new StreakCalculationException(logger, context, message);
    logger.error(exception.message, context);
    throw exception;
  }
}
