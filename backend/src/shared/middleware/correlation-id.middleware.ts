import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestContextService } from '../context';
import { ENV } from '@/config/env';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly requestContextService: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const rawHeader = req.headers['x-session-id'] as string | string[];
    const sessionId = Array.isArray(rawHeader)
      ? rawHeader.join('||')
      : rawHeader;

    const cookieCorrelationId = req.cookies?.['correlation-id'] as
      | string
      | undefined;

    const correlationId = sessionId || cookieCorrelationId || uuidv4();

    (req as Request & { correlationId: string }).correlationId = correlationId;

    res.setHeader('X-Correlation-ID', correlationId);
    res.cookie('correlation-id', correlationId, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    const context = {
      correlationId,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || (req.connection?.remoteAddress as string),
    };

    this.requestContextService.run(context, () => {
      next();
    });
  }
}
