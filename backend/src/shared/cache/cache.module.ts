import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { LoggerModule } from '@/shared/logger';
import { CACHE_PORT, REDIS_CLIENT } from './cache.tokens';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
        return createClient({ url });
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


