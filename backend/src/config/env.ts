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
    .default(3000),
  THROTTLE_LIMIT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(1000))
    .default(10),
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
