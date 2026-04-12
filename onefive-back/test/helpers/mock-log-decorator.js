// Mock for ../../common/logger/logger.decorator
// Replicates @Log() behavior using the injected LogService (this.logger)
// so that spec tests can assert on logger.debug calls.
module.exports = {
  Log:
    () =>
    (_target, _propertyKey, descriptor) => {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args) {
        const className = _target.constructor.name;
        const methodName = _propertyKey.toString();
        const requestArgs = args[0] || {};
        const { transactionId, ...input } = requestArgs;

        if (this.logger && typeof this.logger.debug === 'function') {
          this.logger.debug(`Begin ${className}.${methodName}`, {
            transactionId,
            input,
          });
        }

        const result = await originalMethod.apply(this, args);

        if (this.logger && typeof this.logger.debug === 'function') {
          this.logger.debug(`End ${className}.${methodName}`, {
            transactionId,
            output: result,
          });
        }

        return result;
      };
      return descriptor;
    },
};
