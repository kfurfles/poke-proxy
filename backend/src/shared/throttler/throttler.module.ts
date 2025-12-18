import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HttpThrottlerGuard } from './guards/http-throttler.guard';
import { ENV } from '../../config/env';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: ENV.THROTTLE_LIMIT,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: HttpThrottlerGuard,
    },
  ],
  exports: [ThrottlerModule],
})
export class CustomThrottlerModule {}
