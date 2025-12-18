import { LoggerService } from './logger.service';
import { RequestContextService } from '../context/request-context.service';

describe('LoggerService - setContexto', () => {
  let loggerService: LoggerService;
  let requestContextService: RequestContextService;
  let mockWinstonLogger: any;

  beforeEach(() => {
    requestContextService = new RequestContextService();

    mockWinstonLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      log: jest.fn(),
    };

    loggerService = new LoggerService(requestContextService);
    (loggerService as any).logger = mockWinstonLogger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set context and include it in logs within a request context', () => {
    const contextData = {
      correlationId: 'test-correlation-id',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    const customContext = {
      usecase: 'TestUseCase',
      operation: 'test_operation',
      userId: 'user-123',
    };

    requestContextService.run(contextData, () => {
      loggerService.setContext(customContext);

      loggerService.info('Test message', { additional: 'data' });

      expect(mockWinstonLogger.info).toHaveBeenCalledWith('Test message', {
        additional: 'data',
        correlationId: 'test-correlation-id',
        timestamp: '2024-01-01T00:00:00.000Z',
        usecase: 'TestUseCase',
        operation: 'test_operation',
        userId: 'user-123',
      });
    });
  });

  it('should allow setting context multiple times and merge the data', () => {
    const contextData = {
      correlationId: 'test-correlation-id',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    requestContextService.run(contextData, () => {
      loggerService.setContext({
        usecase: 'TestUseCase',
        step: 'initialization',
      });

      loggerService.setContext({
        step: 'processing',
        userId: 'user-456',
      });

      loggerService.info('Processing started');

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        'Processing started',
        {
          correlationId: 'test-correlation-id',
          timestamp: '2024-01-01T00:00:00.000Z',
          usecase: 'TestUseCase',
          step: 'processing',
          userId: 'user-456',
        },
      );
    });
  });

  it('should work with error logs', () => {
    const contextData = {
      correlationId: 'test-correlation-id',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    const error = new Error('Test error');

    requestContextService.run(contextData, () => {
      loggerService.setContext({
        usecase: 'ErrorTest',
        errorType: 'validation',
      });

      loggerService.error('Error occurred', error, { field: 'name' });

      expect(mockWinstonLogger.error).toHaveBeenCalledWith('Error occurred', {
        error: 'Test error',
        stack: error.stack,
        field: 'name',
        correlationId: 'test-correlation-id',
        timestamp: '2024-01-01T00:00:00.000Z',
        usecase: 'ErrorTest',
        errorType: 'validation',
      });
    });
  });


});
