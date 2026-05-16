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

  let migrationFiles: string[] = [];
  try {
    migrationFiles = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort();
  } catch (err) {
    logger.info('No migration directory found, skipping migrations.');
    return;
  }

  if (migrationFiles.length === 0) {
    logger.info('No SQL migrations found, skipping migrations.');
    return;
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
