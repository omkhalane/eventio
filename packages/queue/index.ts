import { Queue, QueueEvents,Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (times > 1) {
      return null;
    }
    return 100;
  },
});

// Capture Redis error events to prevent unhandled process crashes in dev environment
connection.on('error', (_err) => {
  // Silent capture
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
export { connection,QueueEvents, Worker };
