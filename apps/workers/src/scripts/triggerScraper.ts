import 'dotenv/config';

import { logger } from '@eventio/observability';
import { scrapingQueue } from '@eventio/queue';

const trigger = async () => {
  const rawArg = process.argv[2];
  const platform = rawArg === '--' ? process.argv[3] : rawArg;

  if (!platform) {
    logger.error('Please specify a platform: pnpm scrape:trigger <platform>');
    process.exit(1);
  }

  logger.info({ platform }, 'Triggering manual scrape job...');

  await scrapingQueue.add(
    'manual-scrape',
    { platform },
    {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    },
  );

  logger.info('Job successfully added to scraping queue.');
  process.exit(0);
};

trigger();
