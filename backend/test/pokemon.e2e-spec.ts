import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { startRedisE2E, stopRedisE2E } from './utils/redis-testcontainer';

describe('PokemonController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const started = await startRedisE2E();
    process.env.REDIS_URL = started.redisUrl;

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
    await stopRedisE2E();
  });

  describe('/pokemon (GET)', () => {
    it('should return a list of pokemons with default pagination', () => {
      return request(app.getHttpServer())
        .get('/pokemon')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('pokemons');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('hasNext');
          expect(res.body).toHaveProperty('hasPrevious');
          expect(Array.isArray(res.body.pokemons)).toBe(true);
          expect(res.body.pokemons.length).toBeGreaterThan(0);
          expect(res.body.pokemons.length).toBeLessThanOrEqual(20);
          expect(typeof res.body.total).toBe('number');
        });
    });

    it('should return a list of pokemons with custom limit', () => {
      return request(app.getHttpServer())
        .get('/pokemon?limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.pokemons.length).toBe(10);
        });
    });

    it('should return a list of pokemons with offset', () => {
      return request(app.getHttpServer())
        .get('/pokemon?limit=10&offset=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.pokemons.length).toBe(10);
          expect(res.body.hasPrevious).toBe(true);
        });
    });

    it('should reject limit below minimum', () => {
      return request(app.getHttpServer())
        .get('/pokemon?limit=5')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Limit must be at least 10');
        });
    });

    it('should reject limit above maximum', () => {
      return request(app.getHttpServer())
        .get('/pokemon?limit=25')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Limit must be at most 20');
        });
    });

    it('should reject negative offset', () => {
      return request(app.getHttpServer())
        .get('/pokemon?limit=10&offset=-1')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Offset must be non-negative');
        });
    });

    it('should use default value for invalid limit parameter', () => {
      return request(app.getHttpServer())
        .get('/pokemon?limit=abc')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Limit must be an integer');
        });
    });
  });

  describe('/pokemon/:name (GET)', () => {
    it('should return pokemon details for valid name', () => {
      return request(app.getHttpServer())
        .get('/pokemon/pikachu')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'pikachu');
          expect(res.body).toHaveProperty('height');
          expect(res.body).toHaveProperty('weight');
          expect(res.body).toHaveProperty('baseExperience');
          expect(res.body).toHaveProperty('image');
          expect(res.body).toHaveProperty('stats');
          expect(res.body).toHaveProperty('types');
          expect(res.body).toHaveProperty('abilities');
          expect(Array.isArray(res.body.stats)).toBe(true);
          expect(Array.isArray(res.body.types)).toBe(true);
          expect(Array.isArray(res.body.abilities)).toBe(true);
        });
    });

    it('should handle pokemon with hyphens in name', () => {
      return request(app.getHttpServer())
        .get('/pokemon/mr-mime')
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('mr-mime');
        });
    });

    it('should return 404 for non-existent pokemon', () => {
      return request(app.getHttpServer()).get('/pokemon/fakemon').expect(404);
    });

    it('should handle case insensitivity', () => {
      return request(app.getHttpServer())
        .get('/pokemon/PIKACHU')
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('pikachu');
        });
    });
  });
});
