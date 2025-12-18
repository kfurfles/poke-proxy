import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { Request, Response } from 'express';

@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration, generateKey } =
      requestProps;

    const request = context.switchToHttp().getRequest<Request>();
    const correlationId = request.correlationId || '';
    const ip =
      request.ip || (request.connection?.remoteAddress as string) || '';
    const tracker = `${correlationId}:${ip}`;

    const key = generateKey(context, tracker, throttler.name || 'default');

    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } =
      await this.storageService.increment(
        key,
        ttl,
        limit,
        blockDuration,
        throttler.name || 'default',
      );

    const response = context.switchToHttp().getResponse<Response>();
    const remaining = Math.max(0, limit - totalHits);
    const resetTime =
      Math.ceil(Date.now() / 1000) + Math.ceil(timeToExpire / 1000);

    response.header('X-RateLimit-Limit', String(limit));
    response.header('X-RateLimit-Remaining', String(remaining));
    response.header('X-RateLimit-Reset', String(resetTime));
    response.header('X-RateLimit-Total', String(totalHits));

    if (isBlocked) {
      await this.throwThrottlingException(context, {
        limit,
        ttl,
        key,
        tracker,
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire,
      });
    }

    return true;
  }
}
