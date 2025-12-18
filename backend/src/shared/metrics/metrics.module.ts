import { Module, DynamicModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsInterceptor } from './metrics.interceptor';
import {
  MetricsConfig,
  METRICS_CONFIG_TOKEN,
  DEFAULT_METRICS_CONFIG,
} from './metrics.config';

@Module({})
export class MetricsModule {
  static forRoot(config?: MetricsConfig): DynamicModule {
    const metricsConfig = { ...DEFAULT_METRICS_CONFIG, ...config };

    return {
      module: MetricsModule,
      providers: [
        {
          provide: METRICS_CONFIG_TOKEN,
          useValue: metricsConfig,
        },
        MetricsService,
        MetricsInterceptor,
      ],
      controllers: [MetricsController],
      exports: [MetricsService, MetricsInterceptor, METRICS_CONFIG_TOKEN],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => MetricsConfig | Promise<MetricsConfig>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: MetricsModule,
      providers: [
        {
          provide: METRICS_CONFIG_TOKEN,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return { ...DEFAULT_METRICS_CONFIG, ...config };
          },
          inject: options.inject || [],
        },
        MetricsService,
        MetricsInterceptor,
        {
          provide: APP_INTERCEPTOR,
          useClass: MetricsInterceptor,
        },
      ],
      controllers: [MetricsController],
      exports: [MetricsService, MetricsInterceptor, METRICS_CONFIG_TOKEN],
    };
  }
}
