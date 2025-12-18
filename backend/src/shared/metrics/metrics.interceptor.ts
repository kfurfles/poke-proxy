import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { PATH_METADATA } from '@nestjs/common/constants';
import { MetricsService } from './metrics.service';
import { METRICS_CONFIG_TOKEN } from './metrics.config';
import type { MetricsConfig } from './metrics.config';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly reflector: Reflector,
    @Inject(METRICS_CONFIG_TOKEN)
    private readonly config: MetricsConfig,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const method = request.method;
    const route = this.extractRoute(context, request);

    if (this.shouldExcludeRoute(route, request.url)) {
      return next.handle();
    }

    this.metricsService.incrementHttpRequestsInFlight();

    const requestSize = request.get('content-length');
    if (requestSize) {
      this.metricsService.observeHttpRequestSize(
        method,
        route,
        parseInt(requestSize, 10),
      );
    }

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetrics(method, route, response, startTime);
        },
        error: () => {
          this.recordMetrics(method, route, response, startTime);
        },
      }),
    );
  }

  private shouldExcludeRoute(route: string, originalUrl: string): boolean {
    if (!this.config.excludePaths || this.config.excludePaths.length === 0) {
      return false;
    }

    const urlPath = originalUrl.split('?')[0];

    return this.config.excludePaths.some((excludePath) => {
      if (this.config.useRegexMatching) {
        try {
          const regex = new RegExp(excludePath);
          return regex.test(route) || regex.test(urlPath);
        } catch {
          return route === excludePath || urlPath === excludePath;
        }
      }

      return route === excludePath || urlPath === excludePath;
    });
  }

  private recordMetrics(
    method: string,
    route: string,
    response: Response,
    startTime: number,
  ): void {
    const duration = (Date.now() - startTime) / 1000;
    const statusCode = response.statusCode;

    this.metricsService.decrementHttpRequestsInFlight();

    this.metricsService.incrementHttpRequest(method, route, statusCode);
    this.metricsService.observeHttpRequestDuration(
      method,
      route,
      statusCode,
      duration,
    );

    const responseSize = response.get('content-length');
    if (responseSize) {
      this.metricsService.observeHttpResponseSize(
        method,
        route,
        statusCode,
        parseInt(responseSize, 10),
      );
    }
  }

  private extractRoute(context: ExecutionContext, request: Request): string {
    try {
      const controller = context.getClass();
      const handler = context.getHandler();

      const controllerPath =
        this.reflector.get<string>(PATH_METADATA, controller) || '';

      const methodPath =
        this.reflector.get<string>(PATH_METADATA, handler) || '';

      if (controllerPath || methodPath) {
        let fullPath = `/${controllerPath}/${methodPath}`.replace(/\/+/g, '/');

        if (fullPath !== '/' && fullPath.endsWith('/')) {
          fullPath = fullPath.slice(0, -1);
        }

        return this.normalizePathParameters(fullPath, request.url);
      }
    } catch {
      //
    }

    return this.extractRouteFromUrl(request.url);
  }

  private normalizePathParameters(
    routeTemplate: string,
    actualUrl: string,
  ): string {
    if (routeTemplate.includes(':')) {
      return routeTemplate;
    }

    const actualPath = actualUrl.split('?')[0];

    if (routeTemplate === actualPath) {
      return routeTemplate;
    }

    const templateSegments = routeTemplate
      .split('/')
      .filter((s) => s.length > 0);
    const actualSegments = actualPath.split('/').filter((s) => s.length > 0);

    if (templateSegments.length !== actualSegments.length) {
      return this.normalizeActualPath(actualPath);
    }

    const normalizedSegments = templateSegments.map((templateSeg, index) => {
      const actualSeg = actualSegments[index];

      if (templateSeg === actualSeg) {
        return templateSeg;
      }

      if (this.isDynamicSegment(actualSeg)) {
        return ':id';
      }

      return templateSeg;
    });

    return '/' + normalizedSegments.join('/');
  }

  private isDynamicSegment(segment: string): boolean {
    if (/^[a-fA-F0-9-]{36}$/.test(segment)) {
      return true;
    }

    if (/^\d+$/.test(segment)) {
      return true;
    }

    if (segment.includes('%') || segment.length > 20) {
      return true;
    }

    return false;
  }

  private normalizeActualPath(actualPath: string): string {
    const segments = actualPath.split('/').filter((s) => s.length > 0);

    const normalizedSegments = segments.map((segment) => {
      if (this.isDynamicSegment(segment)) {
        return ':id';
      }
      return segment;
    });

    return '/' + normalizedSegments.join('/');
  }

  private extractRouteFromUrl(url: string): string {
    const path = url.split('?')[0];

    return this.normalizeActualPath(path);
  }
}
