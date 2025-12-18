export interface CachePort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<number>;

  withCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options?: {
      /**
       * Time to live in seconds
       * @default 3600 (1 hour)
       */
      ttl?: number;
    },
  ): Promise<T>;
}


