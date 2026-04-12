import { ForbiddenException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export class OtpOnlySessionRestrictedException extends ForbiddenException {
  constructor(logger: LogService, transactionId?: string) {
    super(OtpOnlySessionRestrictedException.name);
    logger.warn(OtpOnlySessionRestrictedException.name, {
      transactionId,
    });
  }
}
