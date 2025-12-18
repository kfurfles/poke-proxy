import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import type { RedisClientType } from 'redis';
import { LoggerService } from '@/shared/logger';
import type { CachePort } from './cache.port';
import { REDIS_CLIENT } from './cache.tokens';

@Injectable()
export class CacheService implements CachePort, OnApplicationShutdown {
  private connectPromise: Promise<void> | null = null;

  constructor(
    @Inject(REDIS_CLIENT) private readonly client: RedisClientType,
    private readonly logger: LoggerService,
  ) {
    this.client.on('error', (error) => {
      this.logger.warn('[Cache] Redis client error', {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    });
  }

  async onApplicationShutdown(): Promise<void> {
    try {
      if (this.client.isOpen) {
        await this.client.quit();
      }
    } catch (error: unknown) {
      this.logger.warn('[Cache] Failed to close Redis client', {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async get(key: string): Promise<string | null> {
    await this.ensureConnected();
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    await this.ensureConnected();

    if (typeof ttlSeconds === 'number' && Number.isFinite(ttlSeconds)) {
      const ttl = Math.floor(ttlSeconds);
      if (ttl > 0) {
        await this.client.set(key, value, { EX: ttl });
        return;
      }
    }

    await this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    await this.ensureConnected();
    return this.client.del(key);
  }

  public async withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number } = {},
  ): Promise<T> {
    const { ttl = 3600 } = options;

    try {
      const cached = await this.get(key);

      if (cached) {
        this.logger.debug(`[Cache HIT] ${key}`);
        return JSON.parse(cached) as T;
      }

      this.logger.debug(`[Cache MISS] ${key}`);
    } catch (error: unknown) {
      this.logger.warn(`[Cache] Failed to read cache for ${key}`, {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }

    const data = await fetchFn();

    void this.set(key, JSON.stringify(data), ttl)
      .then(() => {
        this.logger.debug(`[Cache SAVED] ${key} (TTL: ${ttl}s)`);
      })
      .catch((error: unknown) => {
        this.logger.warn(`[Cache] Failed to save cache for ${key}`, {
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      });

    return data;
  }

  private async ensureConnected(): Promise<void> {
    if (this.client.isOpen) return;

    if (!this.connectPromise) {
      this.connectPromise = this.client
        .connect()
        .then(() => undefined)
        .catch((error) => {
          this.connectPromise = null;
          throw error;
        });
    }

    await this.connectPromise;
  }
}


