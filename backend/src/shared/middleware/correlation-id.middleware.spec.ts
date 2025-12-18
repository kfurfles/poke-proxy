import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { RequestContextService } from '../context';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let requestContextService: RequestContextService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    requestContextService = new RequestContextService();
    middleware = new CorrelationIdMiddleware(requestContextService);
    mockRequest = {
      headers: {},
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' } as any,
    };
    mockResponse = {
      setHeader: jest.fn(),
      cookie: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should use x-session-id header as correlationId when present', () => {
    const sessionId = 'existing-session-id-123';
    mockRequest.headers = { 'x-session-id': sessionId };
    const runSpy = jest
      .spyOn(requestContextService, 'run')
      .mockImplementation((context, callback) => {
        return callback();
      });

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.correlationId).toBe(sessionId);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      sessionId,
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'correlation-id',
      sessionId,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      },
    );
    expect(runSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: sessionId,
        method: 'GET',
        url: '/test',
      }),
      expect.any(Function),
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should generate new UUID when x-session-id header is not present', () => {
    const generatedUuid = 'generated-uuid-456';
    (uuidv4 as jest.Mock).mockReturnValue(generatedUuid);
    const runSpy = jest
      .spyOn(requestContextService, 'run')
      .mockImplementation((context, callback) => {
        return callback();
      });

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.correlationId).toBe(generatedUuid);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      generatedUuid,
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'correlation-id',
      generatedUuid,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      },
    );
    expect(runSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: generatedUuid,
      }),
      expect.any(Function),
    );
    expect(mockNext).toHaveBeenCalled();
    expect(uuidv4).toHaveBeenCalled();
  });

  it('should generate new UUID when x-session-id header is empty', () => {
    const generatedUuid = 'generated-uuid-789';
    (uuidv4 as jest.Mock).mockReturnValue(generatedUuid);
    mockRequest.headers = { 'x-session-id': '' };
    jest
      .spyOn(requestContextService, 'run')
      .mockImplementation((context, callback) => {
        return callback();
      });

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.correlationId).toBe(generatedUuid);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      generatedUuid,
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'correlation-id',
      generatedUuid,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      },
    );
    expect(mockNext).toHaveBeenCalled();
    expect(uuidv4).toHaveBeenCalled();
  });

  it('should handle multiple header formats correctly', () => {
    const sessionId = 'session-with-multiple-values';
    mockRequest.headers = { 'x-session-id': [sessionId, 'other-value'] };
    jest
      .spyOn(requestContextService, 'run')
      .mockImplementation((context, callback) => {
        return callback();
      });

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.correlationId).toBe(`${sessionId}||other-value`);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-Correlation-ID',
      `${sessionId}||other-value`,
    );
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'correlation-id',
      `${sessionId}||other-value`,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      },
    );
    expect(mockNext).toHaveBeenCalled();
  });
});
