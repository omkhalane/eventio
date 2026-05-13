import { logger } from '@eventio/observability';
import fs from 'fs/promises';
import path from 'path';
import postgres from 'postgres';

const migrationsDir = path.resolve(__dirname, '../../../..', 'packages/db/drizzle');

export const runMigrations = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing');
  }

  const migrationFiles = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    throw new Error(`No SQL migrations found in ${migrationsDir}`);
  }

  const client = postgres(databaseUrl, { max: 1 });

  try {
    for (const file of migrationFiles) {
      const migrationSql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      await client.unsafe(migrationSql);
      logger.info({ migration: file }, 'Applied API migration');
    }
  } finally {
    await client.end();
  }
};
