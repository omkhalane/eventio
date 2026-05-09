import { scrapingQueue } from '@eventio/queue';
import { logger } from '@eventio/observability';

const CRON_SCHEDULES = [
  { platform: 'codeforces', pattern: '0 */4 * * *' }, // Every 4 hours
  { platform: 'leetcode', pattern: '30 */4 * * *' },  // Every 4 hours, offset by 30 mins
  { platform: 'hackerrank', pattern: '0 0 * * *' },   // Once a day
];

const startScheduler = async () => {
  logger.info('Starting worker scheduler...');

  for (const job of CRON_SCHEDULES) {
    // Add repeatable job to BullMQ
    await scrapingQueue.add(
      `cron-scrape-${job.platform}`,
      { platform: job.platform },
      {
        repeat: { pattern: job.pattern },
        removeOnComplete: true,
      }
    );
    logger.info({ platform: job.platform, pattern: job.pattern }, 'Scheduled scraper job');
  }
};

startScheduler();
