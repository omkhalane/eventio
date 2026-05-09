import Fastify from 'fastify';
import cors from '@fastify/cors';
import { logger } from '@eventio/observability';
import { db, searchDocuments } from '@eventio/db';
import { desc, and, gte, lte, sql } from 'drizzle-orm';

const fastify = Fastify({
  logger: false, // We use pino manually
});

fastify.register(cors, {
  origin: process.env.FRONTEND_URL || '*',
});

fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

fastify.get<{
  Querystring: {
    platforms?: string;
    startDate?: string;
    endDate?: string;
    categories?: string;
    search?: string;
  }
}>('/api/v1/events', async (request, reply) => {
  try {
    const { platforms, startDate, endDate, categories, search } = request.query;
    
    const conditions = [];
    if (startDate) conditions.push(gte(searchDocuments.startTime, new Date(startDate)));
    if (endDate) conditions.push(lte(searchDocuments.startTime, new Date(endDate)));
    if (platforms) {
      const platformList = platforms.split(',');
      conditions.push(sql`${searchDocuments.platformsJson} ?| array[${sql.raw(platformList.map(p => `'${p}'`).join(','))}]`);
    }
    if (categories) {
      const categoryList = categories.split(',');
      conditions.push(sql`${searchDocuments.tagsJson} ?| array[${sql.raw(categoryList.map(c => `'${c}'`).join(','))}]`);
    }
    if (search) {
      conditions.push(sql`${searchDocuments.title} ILIKE ${'%' + search + '%'}`);
    }

    const query = db.select().from(searchDocuments).where(and(...conditions)).orderBy(desc(searchDocuments.startTime)).limit(50);
    const data = await query;
    return { data };
  } catch (err) {
    logger.error({ err }, 'Failed to fetch events');
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
});

import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const sqlPath = path.resolve(__dirname, '../../../packages/db/drizzle/0000_chemical_lyja.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Migration file not found at ${sqlPath}`);
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const client = postgres(process.env.DATABASE_URL || '');
    await client.unsafe(sql);
    logger.info('Database migrated successfully');
    
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`API server listening on port ${port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
