import { z } from 'zod';

export const ConfigSchema = z.object({
  env: z.enum(['development', 'production', 'test']).default('development'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  // Database
  databaseUrl: z.string().url('Invalid database URL'),
  // Optional Redis for later phases
  redisUrl: z.string().url('Invalid redis URL').optional(),
  // API
  apiPort: z.number().int().positive().default(3000),
  apiHost: z.string().default('localhost'),
});

export type Config = z.infer<typeof ConfigSchema>;

export interface AppConfig extends Config {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

export function validateConfig(config: unknown): Config {
  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Invalid configuration:\n${messages.join('\n')}`);
    }
    throw error;
  }
}

export function loadConfig(): AppConfig {
  const rawConfig = {
    env: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    apiPort: process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : undefined,
    apiHost: process.env.API_HOST,
  };

  const validated = validateConfig(rawConfig);

  return {
    ...validated,
    isDevelopment: validated.env === 'development',
    isProduction: validated.env === 'production',
    isTest: validated.env === 'test',
  };
}
