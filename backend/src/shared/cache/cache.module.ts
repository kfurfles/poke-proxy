import { Global, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { LoggerModule } from '@/shared/logger';
import { ENV } from '@/config/env';
import { CACHE_PORT, REDIS_CLIENT } from './cache.tokens';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return createClient({ url: ENV.REDIS_URL });
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


