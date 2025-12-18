import { RequestContextService } from './request-context.service';

describe('RequestContextService', () => {
  let service: RequestContextService;

  beforeEach(() => {
    service = new RequestContextService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return undefined when no context is set', () => {
    expect(service.getContext()).toBeUndefined();
    expect(service.getCorrelationId()).toBeUndefined();
    expect(service.hasContext()).toBe(false);
  });

  it('should run callback within context and provide access to context data', () => {
    const contextData = {
      correlationId: 'test-correlation-id',
      timestamp: '2024-01-01T00:00:00.000Z',
      method: 'GET',
      url: '/test',
    };

    let capturedContext: any;
    let capturedCorrelationId: string | undefined;
    let hasContext = false;

    const result = service.run(contextData, () => {
      capturedContext = service.getContext();
      capturedCorrelationId = service.getCorrelationId();
      hasContext = service.hasContext();
      return 'test-result';
    });

    expect(result).toBe('test-result');
    expect(capturedContext).toEqual(contextData);
    expect(capturedCorrelationId).toBe('test-correlation-id');
    expect(hasContext).toBe(true);
  });

  it('should allow setting additional context data within a running context', () => {
    const initialContext = {
      correlationId: 'test-correlation-id',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    service.run(initialContext, () => {
      service.setContextData({
        method: 'POST',
        url: '/api/test',
        userAgent: 'test-agent',
      });

      const context = service.getContext();
      expect(context).toEqual({
        correlationId: 'test-correlation-id',
        timestamp: '2024-01-01T00:00:00.000Z',
        method: 'POST',
        url: '/api/test',
        userAgent: 'test-agent',
      });
    });
  });

  it('should return context data as object', () => {
    const contextData = {
      correlationId: 'test-correlation-id',
      timestamp: '2024-01-01T00:00:00.000Z',
      method: 'GET',
      url: '/test',
    };

    service.run(contextData, () => {
      const data = service.getContextData();
      expect(data).toEqual(contextData);
      expect(data).not.toBe(contextData);
    });
  });

  it('should return empty object when no context exists', () => {
    const data = service.getContextData();
    expect(data).toEqual({});
  });

  it('should handle setting correlation ID within context', () => {
    const initialContext = {
      correlationId: 'initial-id',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    service.run(initialContext, () => {
      service.setCorrelationId('updated-id');
      expect(service.getCorrelationId()).toBe('updated-id');

      const context = service.getContext();
      expect(context?.correlationId).toBe('updated-id');
    });
  });

  it('should not affect context after run callback completes', () => {
    const contextData = {
      correlationId: 'test-correlation-id',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    service.run(contextData, () => {
      expect(service.hasContext()).toBe(true);
    });

    expect(service.hasContext()).toBe(false);
    expect(service.getContext()).toBeUndefined();
    expect(service.getCorrelationId()).toBeUndefined();
  });
});
