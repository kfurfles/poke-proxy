import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { startRedisE2E } from './utils/redis-testcontainer';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let redis: StartedRedisContainer;

  beforeAll(async () => {
    const started = await startRedisE2E();
    redis = started.container;
    process.env.REDIS_URL = started.redisUrl;

    const { AppModule } = await import('@/app.module');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

  it('/ (GET) should return 404 (no root route)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });
});
