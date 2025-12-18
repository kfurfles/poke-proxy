import { z } from 'zod'

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://127.0.0.1:3001'),
  VITE_APP_ENV: z.enum(['development', 'production']).default('development'),
})

/**
 * Runtime-validated env (Vite).
 * Fail-fast so misconfig is obvious during dev/test.
 */
export const env = EnvSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_ENV:
    import.meta.env.VITE_APP_ENV ?? (import.meta.env.PROD ? 'production' : 'development'),
})
