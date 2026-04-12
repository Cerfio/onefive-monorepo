import { Provider } from '@nestjs/common';
import loggerLogstashInstance from './logger.config';

export const LoggerProvider: Provider = {
  provide: 'Logger',
  useFactory: () => {
    return loggerLogstashInstance();
  },
};
