import { Injectable } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { RequestContextService } from '../context';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor(private readonly requestContextService: RequestContextService) {
    mkdirSync('logs', { recursive: true });

    this.logger = winston.createLogger({
      level:
        process.env.LOG_LEVEL ??
        (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'api-proxy' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),

        new winston.transports.DailyRotateFile({
          filename: 'logs/app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, this.enrichWithContext(meta));
  }

  error(message: string, error?: Error, meta?: any): void {
    this.logger.error(
      message,
      this.enrichWithContext({
        error: error?.message || error,
        stack: error?.stack,
        ...meta,
      }),
    );
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, this.enrichWithContext(meta));
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, this.enrichWithContext(meta));
  }

  verbose(message: string, meta?: any): void {
    this.logger.verbose(message, this.enrichWithContext(meta));
  }

  log(level: string, message: string, meta?: any): void {
    this.logger.log(level, message, this.enrichWithContext(meta));
  }

  setContext(context: Record<string, any>): void {
    this.requestContextService.setContextData(context);
  }

  private enrichWithContext(meta?: any): any {
    const contextData = this.requestContextService.getContextData();
    return {
      ...meta,
      ...contextData,
    };
  }
}
