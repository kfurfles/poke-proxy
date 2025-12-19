import { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { CacheService } from '@/shared/cache';
import { startRedisE2E, stopRedisE2E } from './utils/redis-testcontainer';
import { WarmupPokemonListPagesUseCase } from '@/modules/pokemon/use_cases/warmup_pokemon_list_pages.use_case';

describe('WarmupPokemonListPages (e2e)', () => {
  let app: INestApplication;
  let cacheService: CacheService;
  let warmupUseCase: WarmupPokemonListPagesUseCase;

  beforeAll(async () => {
    const started = await startRedisE2E();
    process.env.REDIS_URL = started.redisUrl;
    process.env.WARMUP_COUNT_PAGES_CACHE = '0'; // Disable auto warmup on bootstrap

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cacheService = app.get<CacheService>(CacheService);
    warmupUseCase = app.get<WarmupPokemonListPagesUseCase>(
      WarmupPokemonListPagesUseCase,
    );
  });

  afterAll(async () => {
    await app?.close();
    await stopRedisE2E();
  });

  it('should warmup 3 pages and cache them in Redis', async () => {
    // Execute warmup for 3 pages
    const result = await warmupUseCase.execute(3);

    // Verify the result
    expect(result.pagesRequested).toBe(3);
    expect(result.pagesWarmed).toBe(3);
    expect(result.pagesFailed).toBe(0);
    expect(result.details).toEqual([
      { page: 0, offset: 0, success: true },
      { page: 1, offset: 20, success: true },
      { page: 2, offset: 40, success: true },
    ]);

    // Verify that the cache keys exist in Redis
    const cacheKeys = [
      'pokemon:list:limit:20:offset:0',
      'pokemon:list:limit:20:offset:20',
      'pokemon:list:limit:20:offset:40',
    ];

    for (const key of cacheKeys) {
      const cachedRaw = await cacheService.get(key);
      expect(cachedRaw).toBeDefined();
      expect(cachedRaw).not.toBeNull();

      const cached = JSON.parse(cachedRaw as string);
      expect(cached).toHaveProperty('pokemons');
      expect(cached).toHaveProperty('total');
      expect(cached).toHaveProperty('hasNext');
      expect(cached).toHaveProperty('hasPrevious');
      expect(Array.isArray(cached.pokemons)).toBe(true);
    }
  });

  it('should verify cache key format for first page', async () => {
    await warmupUseCase.execute(1);

    const key = 'pokemon:list:limit:20:offset:0';
    const cachedRaw = await cacheService.get(key);

    expect(cachedRaw).toBeDefined();
    expect(cachedRaw).not.toBeNull();

    const cached = JSON.parse(cachedRaw as string);
    expect(cached.pokemons.length).toBeGreaterThan(0);
    expect(typeof cached.total).toBe('number');
    expect(typeof cached.hasNext).toBe('boolean');
    expect(typeof cached.hasPrevious).toBe('boolean');
  });

  it('should handle empty pages request (0 pages)', async () => {
    const result = await warmupUseCase.execute(0);

    expect(result.pagesRequested).toBe(0);
    expect(result.pagesWarmed).toBe(0);
    expect(result.pagesFailed).toBe(0);
    expect(result.details).toEqual([]);
  });

  it('should warmup 5 pages with correct offsets', async () => {
    const result = await warmupUseCase.execute(5);

    expect(result.pagesRequested).toBe(5);
    expect(result.pagesWarmed).toBe(5);
    expect(result.pagesFailed).toBe(0);

    // Verify all 5 pages are cached
    const expectedOffsets = [0, 20, 40, 60, 80];
    
    for (let i = 0; i < expectedOffsets.length; i++) {
      const key = `pokemon:list:limit:20:offset:${expectedOffsets[i]}`;
      const cachedRaw = await cacheService.get(key);
      expect(cachedRaw).toBeDefined();
      expect(cachedRaw).not.toBeNull();

      const cached = JSON.parse(cachedRaw as string);
      expect(cached).toHaveProperty('pokemons');
      
      expect(result.details[i]).toEqual({
        page: i,
        offset: expectedOffsets[i],
        success: true,
      });
    }
  });

  it('should reuse cached data on subsequent calls', async () => {
    // First warmup
    await warmupUseCase.execute(2);

    const key1 = 'pokemon:list:limit:20:offset:0';
    const firstCacheRaw = await cacheService.get(key1);
    expect(firstCacheRaw).not.toBeNull();

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Second warmup
    await warmupUseCase.execute(2);

    const key2 = 'pokemon:list:limit:20:offset:0';
    const secondCacheRaw = await cacheService.get(key2);
    expect(secondCacheRaw).not.toBeNull();

    // Should be the same cached data (cache hit)
    expect(firstCacheRaw).toEqual(secondCacheRaw);
  });
});

