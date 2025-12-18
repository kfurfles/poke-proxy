import { LoggerService } from '../logger/logger.service';

interface LogContextConfig {
  name?: string;
  operation: string;
  [key: string]: unknown;
}

export function LogContext(contextConfig: LogContextConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      return descriptor;
    }

    descriptor.value = function (this: any, ...args: any[]) {
      const logger: LoggerService = this.logger;

      if (logger && typeof logger.setContext === 'function') {
        const finalContext = {
          name: contextConfig.name || this.constructor.name,
          ...contextConfig,
        };

        logger.setContext(finalContext);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
