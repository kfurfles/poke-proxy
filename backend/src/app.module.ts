import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PokemonModule } from './modules/pokemon/pokemon.module';
import { RequestContextModule } from './shared/context';
import { LoggerModule } from './shared/logger';
import { CustomThrottlerModule } from './shared/throttler';
import { CorrelationIdMiddleware } from './shared/middleware';
import { CacheModule } from './shared/cache';
import { MetricsInterceptor, MetricsModule } from './shared/metrics';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    RequestContextModule,
    LoggerModule,
    CacheModule,
    CustomThrottlerModule,
    MetricsModule.forRoot(),
    PokemonModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
