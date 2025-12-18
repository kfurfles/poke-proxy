import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { LoggerModule } from '@/shared/logger';
import { envSchema } from '@/config/env';
import { CACHE_PORT, REDIS_CLIENT } from './cache.tokens';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        // Important for tests: E2E sets process.env.REDIS_URL at runtime (before module compilation),
        // so we must read env at factory-time (not at import-time via a cached ENV constant).
        const redisUrl = envSchema.shape.REDIS_URL.parse(process.env.REDIS_URL);
        return createClient({ url: redisUrl });
      },
    },
    CacheService,
    {
      provide: CACHE_PORT,
      useExisting: CacheService,
    },
  ],
  exports: [CACHE_PORT, CacheService],
})
export class CacheModule {}


