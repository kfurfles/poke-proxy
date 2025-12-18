import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
  correlationId: string;
  timestamp: string;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  [key: string]: any;
}

@Injectable()
export class RequestContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.asyncLocalStorage.run(context, callback);
  }

  getContext(): RequestContext | undefined {
    return this.asyncLocalStorage.getStore();
  }

  getCorrelationId(): string | undefined {
    const context = this.getContext();
    return context?.correlationId;
  }

  setCorrelationId(correlationId: string): void {
    const context = this.getContext();
    if (context) {
      context.correlationId = correlationId;
    }
  }

  setContextData(data: Record<string, any>): void {
    const context = this.getContext();
    if (context) {
      Object.assign(context, data);
    }
  }

  getContextData(): Record<string, any> {
    const context = this.getContext();
    return context ? { ...context } : {};
  }

  hasContext(): boolean {
    return this.getContext() !== undefined;
  }
}
