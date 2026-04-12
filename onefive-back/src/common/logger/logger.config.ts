import { Logger } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
const logger = new Logger();

const noopLogger = {
  debug: (..._args: unknown[]) => {},
  info: (..._args: unknown[]) => {},
  warn: (..._args: unknown[]) => {},
  error: (..._args: unknown[]) => {},
  log: (..._args: unknown[]) => {},
};

const loggerLogstashInstance = () => {
  if (process.env.NODE_ENV === 'test') {
    return noopLogger as unknown as LogService;
  }
  return LogService.getInstance({
    serviceName: 'onefive-authentication',
    logstashHost: process.env.LOGSTASH_HOST,
    logstashPort: process.env.LOGSTASH_PORT,
    level: 'debug',
    callback: (level: string, message: string) => {
      logger[level](`${message}`);
    },
  });
};

export default loggerLogstashInstance;
