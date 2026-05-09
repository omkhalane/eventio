export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value || defaultValue || '';
}

export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];

  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value ? parseInt(value, 10) : defaultValue!;
}

export function getEnvBoolean(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key];

  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value ? value.toLowerCase() === 'true' : defaultValue!;
}
