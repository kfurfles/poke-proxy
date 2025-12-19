import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';

export interface StartedRedisE2E {
  container: StartedRedisContainer;
  redisUrl: string;
}

type RedisE2EState = {
  refCount: number;
  starting?: Promise<StartedRedisE2E>;
  started?: StartedRedisE2E;
};

const REDIS_E2E_STATE_KEY = Symbol.for('poke-proxy.redis-e2e-state');

function getRedisE2EState(): RedisE2EState {
  const g = globalThis as unknown as {
    [REDIS_E2E_STATE_KEY]?: RedisE2EState;
  };
  if (!g[REDIS_E2E_STATE_KEY]) {
    g[REDIS_E2E_STATE_KEY] = { refCount: 0 };
  }
  return g[REDIS_E2E_STATE_KEY];
}

/**
 * Starts (or reuses) a single Redis testcontainer instance per Jest worker process.
 *
 * Note: To reuse the same container across multiple spec files, ensure e2e Jest runs
 * with `maxWorkers: 1` (or `--runInBand`). Otherwise each worker is a separate process.
 */
export async function startRedisE2E(): Promise<StartedRedisE2E> {
  const state = getRedisE2EState();
  state.refCount += 1;

  if (state.started) return state.started;
  if (!state.starting) {
    state.starting = (async () => {
      const container = await new RedisContainer('redis:7-alpine').start();
      const redisUrl = container.getConnectionUrl();
      return { container, redisUrl };
    })();
  }

  state.started = await state.starting;
  state.starting = undefined;
  return state.started;
}

export async function stopRedisE2E(): Promise<void> {
  const state = getRedisE2EState();
  state.refCount = Math.max(0, state.refCount - 1);
  if (state.refCount > 0) return;

  // If we're stopping while a start is still in-flight, await it then stop.
  if (state.starting) {
    try {
      const started = await state.starting;
      await started.container.stop();
    } finally {
      state.starting = undefined;
      state.started = undefined;
    }
    return;
  }

  if (!state.started) return;
  await state.started.container.stop();
  state.started = undefined;
}

