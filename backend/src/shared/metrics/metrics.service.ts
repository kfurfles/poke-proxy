/* eslint-disable */
import { Injectable } from '@nestjs/common';
import {
  register,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestsInFlight: Gauge<string>;
  private readonly httpRequestSize: Histogram<string>;
  private readonly httpResponseSize: Histogram<string>;

  constructor() {
    collectDefaultMetrics({ register });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register],
    });

    this.httpRequestsInFlight = new Gauge({
      name: 'http_requests_in_flight',
      help: 'Number of HTTP requests currently being processed',
      registers: [register],
    });

    this.httpRequestSize = new Histogram({
      name: 'http_request_size_bytes',
      help: 'Size of HTTP requests in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
      registers: [register],
    });

    this.httpResponseSize = new Histogram({
      name: 'http_response_size_bytes',
      help: 'Size of HTTP responses in bytes',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [100, 1000, 10000, 100000, 1000000],
      registers: [register],
    });
  }

  incrementHttpRequest(
    method: string,
    route: string,
    statusCode: number,
  ): void {
    this.httpRequestsTotal.labels(method, route, statusCode.toString()).inc();
  }

  observeHttpRequestDuration(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }

  incrementHttpRequestsInFlight(): void {
    this.httpRequestsInFlight.inc();
  }

  decrementHttpRequestsInFlight(): void {
    this.httpRequestsInFlight.dec();
  }

  observeHttpRequestSize(method: string, route: string, size: number): void {
    this.httpRequestSize.labels(method, route).observe(size);
  }

  observeHttpResponseSize(
    method: string,
    route: string,
    statusCode: number,
    size: number,
  ): void {
    this.httpResponseSize
      .labels(method, route, statusCode.toString())
      .observe(size);
  }

  getMetrics(): Promise<string> {
    return register.metrics();
  }

  getContentType(): string {
    return register.contentType;
  }

  clearMetrics(): void {
    register.clear();
  }
}
