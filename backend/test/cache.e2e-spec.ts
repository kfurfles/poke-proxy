import { Controller, Get, INestApplication, Module, Param } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { CacheService } from '@/shared/cache';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { startRedisE2E } from './utils/redis-testcontainer';

@Controller('test-cache')
class TestCacheController {
  private calls = 0;

  constructor(private readonly cache: CacheService) {}

  @Get('with-cache/:key')
  async withCache(@Param('key') key: string) {
    return this.cache.withCache(
      `e2e:${key}`,
      async () => {
        this.calls += 1;
        return { calls: this.calls };
      },
      { ttl: 60 },
    );
  }
}

@Module({
  imports: [AppModule],
  controllers: [TestCacheController],
})
class TestAppModule {}

describe('Cache (e2e)', () => {
  let app: INestApplication;
  let redis: StartedRedisContainer;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  beforeAll(async () => {
    const started = await startRedisE2E();
    redis = started.container;
    process.env.REDIS_URL = started.redisUrl;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await redis?.stop();
  });

  it('should cache responses (MISS then HIT)', async () => {
    const first = await request(app.getHttpServer())
      .get('/test-cache/with-cache/demo')
      .expect(200);

    expect(first.body).toEqual({ calls: 1 });

    // withCache saves in fire-and-forget; give Redis a moment
    await sleep(50);

    const second = await request(app.getHttpServer())
      .get('/test-cache/with-cache/demo')
      .expect(200);

    expect(second.body).toEqual({ calls: 1 });
  });
});


