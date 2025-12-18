import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PokemonModule } from './modules/pokemon/pokemon.module';
import { RequestContextModule } from './shared/context';
import { LoggerModule } from './shared/logger';
import { CustomThrottlerModule } from './shared/throttler';
import { CorrelationIdMiddleware } from './shared/middleware';

@Module({
  imports: [
    RequestContextModule,
    LoggerModule,
    CustomThrottlerModule,
    PokemonModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
