import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';

export interface StartedRedisE2E {
  container: StartedRedisContainer;
  redisUrl: string;
}

export async function startRedisE2E(): Promise<StartedRedisE2E> {
  const container = await new RedisContainer('redis:7-alpine').start();
  const redisUrl = container.getConnectionUrl();

  return { container, redisUrl };
}


