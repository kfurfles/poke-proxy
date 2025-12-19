import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .default(3001),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  THROTTLE_LIMIT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(1000))
    .default(10),
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z
    .string()
    .url()
    .default('http://localhost:4318/v1/traces'),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_BASE_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1beta'),

  WARMUP_FAMOUS_POKEMON_CACHE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),

  WARMUP_COUNT_PAGES_CACHE: z
    .string()
    .default('0')
    .transform(Number)
    .pipe(z.number().min(0).max(100)),
  
  CORS_ALLOWED_ORIGINS: z
    .string()
    .optional()
    .transform((v) => v?.split(',').map(url => url.trim()).filter(Boolean) ?? []),
});

export type EnvConfig = z.infer<typeof envSchema>;

const validateEnv = (): EnvConfig => {
  try {
    return envSchema.parse(process.env);
  } catch (e) {
    const error = e as Error;
    const messageError = `❌Boostrap Error: \n${error.message}\nStack: ${error.stack}`;
    console.error(messageError);
    process.exit(1);
  }
};

export const ENV = validateEnv();
