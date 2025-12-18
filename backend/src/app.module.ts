import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PokemonModule } from './modules/pokemon/pokemon.module';
import { RequestContextModule } from './shared/context';
import { LoggerModule } from './shared/logger';
import { CustomThrottlerModule } from './shared/throttler';
import { CorrelationIdMiddleware } from './shared/middleware';
import { CacheModule } from './shared/cache';

@Module({
  imports: [
    RequestContextModule,
    LoggerModule,
    CacheModule,
    CustomThrottlerModule,
    PokemonModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
