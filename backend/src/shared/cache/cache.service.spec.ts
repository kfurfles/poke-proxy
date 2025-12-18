import { CacheService } from './cache.service';

describe('CacheService', () => {
  const flushAsync = async () => new Promise<void>((r) => setImmediate(r));

  const createMocks = () => {
    const redisClient = {
      isOpen: true,
      connect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn<Promise<string | null>, [string]>(),
      set: jest.fn<Promise<'OK'>, any[]>(),
      del: jest.fn<Promise<number>, [string]>(),
    };

    const logger = {
      debug: jest.fn(),
      warn: jest.fn(),
    };

    const service = new CacheService(redisClient as any, logger as any);

    return { redisClient, logger, service };
  };

  it('get should return null when key does not exist', async () => {
    const { redisClient, service } = createMocks();
    redisClient.get.mockResolvedValue(null);

    await expect(service.get('missing')).resolves.toBeNull();
    expect(redisClient.get).toHaveBeenCalledWith('missing');
  });

  it('set should call redis.set without TTL when ttlSeconds is undefined', async () => {
    const { redisClient, service } = createMocks();
    redisClient.set.mockResolvedValue('OK');

    await service.set('k', 'v');
    expect(redisClient.set).toHaveBeenCalledWith('k', 'v');
  });

  it('set should call redis.set with EX when ttlSeconds is provided', async () => {
    const { redisClient, service } = createMocks();
    redisClient.set.mockResolvedValue('OK');

    await service.set('k', 'v', 10);
    expect(redisClient.set).toHaveBeenCalledWith('k', 'v', { EX: 10 });
  });

  it('del should return the number of deleted keys', async () => {
    const { redisClient, service } = createMocks();
    redisClient.del.mockResolvedValue(1);

    await expect(service.del('k')).resolves.toBe(1);
    expect(redisClient.del).toHaveBeenCalledWith('k');
  });

  it('withCache should return cached value on HIT and not call fetchFn', async () => {
    const { redisClient, logger, service } = createMocks();
    redisClient.get.mockResolvedValue(JSON.stringify({ ok: true }));

    const fetchFn = jest.fn().mockResolvedValue({ ok: false });

    await expect(service.withCache('key', fetchFn)).resolves.toEqual({ ok: true });
    expect(fetchFn).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith('[Cache HIT] key');
  });

  it('withCache should call fetchFn on MISS and save to cache fire-and-forget', async () => {
    const { redisClient, logger, service } = createMocks();
    redisClient.get.mockResolvedValue(null);
    redisClient.set.mockResolvedValue('OK');

    const fetchFn = jest.fn().mockResolvedValue({ id: 123 });

    await expect(service.withCache('key', fetchFn, { ttl: 5 })).resolves.toEqual({
      id: 123,
    });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledWith('[Cache MISS] key');

    await flushAsync();
    expect(redisClient.set).toHaveBeenCalledWith('key', JSON.stringify({ id: 123 }), {
      EX: 5,
    });
    expect(logger.debug).toHaveBeenCalledWith('[Cache SAVED] key (TTL: 5s)');
  });

  it('withCache should tolerate read errors and still return fetchFn result', async () => {
    const { redisClient, logger, service } = createMocks();
    redisClient.get.mockRejectedValue(new Error('redis down'));
    redisClient.set.mockResolvedValue('OK');

    const fetchFn = jest.fn().mockResolvedValue({ value: 'x' });

    await expect(service.withCache('key', fetchFn)).resolves.toEqual({ value: 'x' });
    expect(logger.warn).toHaveBeenCalledWith(
      '[Cache] Failed to read cache for key',
      expect.objectContaining({ errorMessage: 'redis down' }),
    );

    await flushAsync();
    expect(redisClient.set).toHaveBeenCalled();
  });

  it('withCache should tolerate save errors (fire-and-forget)', async () => {
    const { redisClient, logger, service } = createMocks();
    redisClient.get.mockResolvedValue(null);
    redisClient.set.mockRejectedValue(new Error('write failed'));

    const fetchFn = jest.fn().mockResolvedValue({ value: 'x' });

    await expect(service.withCache('key', fetchFn, { ttl: 2 })).resolves.toEqual({
      value: 'x',
    });

    await flushAsync();
    expect(logger.warn).toHaveBeenCalledWith(
      '[Cache] Failed to save cache for key',
      expect.objectContaining({ errorMessage: 'write failed' }),
    );
  });

  it('should lazy-connect when redis client is not open', async () => {
    const { redisClient, service } = createMocks();
    redisClient.isOpen = false;
    redisClient.get.mockResolvedValue(null);

    await service.get('k');
    expect(redisClient.connect).toHaveBeenCalledTimes(1);
  });
});


