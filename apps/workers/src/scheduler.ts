import 'dotenv/config';
import { scrapingQueue } from '@eventio/queue';
import { logger } from '@eventio/observability';

const CRON_SCHEDULES = [
  { platform: 'codeforces', pattern: '0 */4 * * *' }, // Every 4 hours
  { platform: 'leetcode', pattern: '30 */4 * * *' }, // Every 4 hours, offset by 30 mins
  { platform: 'hackerrank', pattern: '0 0 * * *' }, // Once a day
  { platform: 'unstop', pattern: '0 2 * * *' }, // Once a day
  { platform: 'devpost', pattern: '30 2 * * *' }, // Once a day, offset by 30 mins
  { platform: 'atcoder', pattern: '0 */6 * * *' },
  { platform: 'codechef', pattern: '20 */6 * * *' },
  { platform: 'geeksforgeeks', pattern: '40 */6 * * *' },
  { platform: 'mlh', pattern: '0 3 * * *' },
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
      },
    );
    logger.info({ platform: job.platform, pattern: job.pattern }, 'Scheduled scraper job');
  }
};

startScheduler();
