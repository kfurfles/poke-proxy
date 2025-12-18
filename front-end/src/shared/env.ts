import { z } from 'zod'

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://127.0.0.1:3001'),
})

/**
 * Runtime-validated env (Vite).
 * Fail-fast so misconfig is obvious during dev/test.
 */
export const env = EnvSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
})
