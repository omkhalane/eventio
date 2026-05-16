import 'dotenv/config';

import { logger } from '@eventio/observability';
import { scrapingQueue } from '@eventio/queue';

// Automatic execution disabled per requirement
const CRON_SCHEDULES: Array<{ platform: string; pattern: string }> = [];

const startScheduler = async () => {
  logger.info('Scheduler started (no automatic cron jobs active)...');

  for (const job of CRON_SCHEDULES) {
    // Add repeatable job to BullMQ
    await scrapingQueue.add(
      `cron-scrape-${job.platform}`,
      { platform: job.platform },
      {
        repeat: { pattern: job.pattern },
        removeOnComplete: true,
      },
    );
    logger.info({ platform: job.platform, pattern: job.pattern }, 'Scheduled scraper job');
  }
};

startScheduler();
