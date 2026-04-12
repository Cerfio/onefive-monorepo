import loggerLogstashInstance from './logger.config';

interface LogOptions {
  alias?: string;
}

import { FIELD_TO_MASK, FORCE_MASK_NAME, maskSensitiveData } from '../utils';

export function Log(options: LogOptions = {}): MethodDecorator {
  const logger = loggerLogstashInstance();
  return function (
    target: Object,
    propertyKey: string | symbol,
    // rome-ignore lint/suspicious/noExplicitAny: <explanation>
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    const className = options.alias || target.constructor.name;
    const methodName = propertyKey.toString();
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      const requestArgs = args[0] as
        | { transactionId?: string; [key: string]: unknown }
        | undefined;
      const transactionId =
        requestArgs?.transactionId ?? `system-${Date.now()}`;
      const input =
        requestArgs && typeof requestArgs === 'object'
          ? (({ transactionId: _t, ...rest }) => rest)(requestArgs)
          : {};
      const requestInputArgsMasked = maskSensitiveData(input, FIELD_TO_MASK);

      logger.debug(`Begin ${className}.${methodName}`, {
        transactionId,
        input: requestInputArgsMasked,
        class: className,
        method: methodName,
        action: 'entering',
      });
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      const requestOutputArgsMasked = maskSensitiveData(
        result,
        FIELD_TO_MASK,
        FORCE_MASK_NAME.includes(className) ||
          FORCE_MASK_NAME.includes(methodName),
      );
      logger.debug(`End ${className}.${methodName}`, {
        transactionId,
        output: requestOutputArgsMasked,
        timeRequest: (end - start).toFixed(2),
        class: className,
        method: methodName,
        action: 'exiting',
      });
      return result;
    };

    return descriptor;
  };
}
