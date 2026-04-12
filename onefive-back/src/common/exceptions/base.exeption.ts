import { HttpException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';

export abstract class BaseLoggedException extends HttpException {
  protected constructor(
    exceptionType: new (message: string) => HttpException,
    logger: LogService,
    args: object,
    errorMessage: string,
  ) {
    const exception = new exceptionType(errorMessage);
    super(errorMessage, exception.getStatus());

    // Logger avec un message plus descriptif incluant les détails
    try {
      const argsString = JSON.stringify(args, null, 2);
      const logMessage = `${errorMessage} - Details: ${argsString}`;
      logger.error(logMessage, { ...args });
    } catch (stringifyError) {
      // Si JSON.stringify échoue (objets circulaires), logger sans stringify
      logger.error(`${errorMessage} - Details (unable to stringify):`, {
        ...args,
      });
    }
  }

  static throw<T extends BaseLoggedException>(
    this: new (logger: LogService, args: object, errorMessage: string) => T,
    logger: LogService,
    args: object,
  ): never {
    // Construire un message d'erreur plus descriptif à partir des args
    const errorMessage =
      (args as any)?.error || (args as any)?.errorMessage || this.name;
    throw new this(logger, args, errorMessage);
  }

  static create<T extends BaseLoggedException>(
    this: new (logger: LogService, args: object, errorMessage: string) => T,
    logger: LogService,
    args: object,
  ): T {
    return new this(logger, args, this.name);
  }
}
