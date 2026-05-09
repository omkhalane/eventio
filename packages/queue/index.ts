import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const QUEUES = {
  SCRAPING: 'scraping',
  NORMALIZATION: 'normalization',
  DEDUPE: 'dedupe',
  INDEXING: 'indexing',
} as const;

// Queue definitions
export const scrapingQueue = new Queue(QUEUES.SCRAPING, { connection });
export const normalizationQueue = new Queue(QUEUES.NORMALIZATION, { connection });
export const dedupeQueue = new Queue(QUEUES.DEDUPE, { connection });
export const indexingQueue = new Queue(QUEUES.INDEXING, { connection });

// Export to allow apps to create their own workers
export { Worker, QueueEvents, connection };
