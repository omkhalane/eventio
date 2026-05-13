import 'dotenv/config';
import {
  Worker,
  QUEUES,
  connection,
  normalizationQueue,
  dedupeQueue,
  indexingQueue,
} from '@eventio/queue';
import { logger } from '@eventio/observability';
import {
  scrapeAtcoder,
  scrapeCodechef,
  scrapeDevpost,
  scrapeGeeksforgeeks,
  scrapeMlh,
  scrapeUnstop,
} from '@eventio/scraper-core';
import { db, rawScrapedEvents, events, searchDocuments, sql } from '@eventio/db';
import crypto from 'crypto';

const persistScrapedEvents = async (
  records: Array<{
    sourcePlatformId: string;
    sourceUrl: string;
    rawPayload: Record<string, unknown>;
  }>,
) => {
  if (records.length === 0) {
    return 0;
  }

  let insertedCount = 0;
  for (let index = 0; index < records.length; index += 100) {
    const chunk = records.slice(index, index + 100);
    const inserted = await db.insert(rawScrapedEvents).values(chunk).returning();
    insertedCount += inserted.length;
    await normalizationQueue.addBulk(
      inserted.map((row) => ({ name: 'normalize', data: { rawId: row.id } })),
    );
  }

  return insertedCount;
};

const startWorkers = async () => {
  logger.info('Starting worker processes...');

  // 1. Scraping Worker
  new Worker(
    QUEUES.SCRAPING,
    async (job) => {
      logger.info({ jobId: job.id, platform: job.data.platform }, 'Processing scrape job');
      if (job.data.platform === 'codeforces') {
        const res = await fetch('https://codeforces.com/api/contest.list');
        const data = await res.json();

        if (data.status !== 'OK') {
          throw new Error(`Codeforces API error: ${data.comment}`);
        }

        // Fetch all available contests
        const upcoming = data.result;

        if (upcoming.length > 0) {
          const payloads = upcoming.map((contest: any) => ({
            sourcePlatformId: 'codeforces',
            sourceUrl: `https://codeforces.com/contests/${contest.id}`,
            rawPayload: contest,
          }));

          // Split into chunks of 100 to avoid pg parameter limit issues
          for (let i = 0; i < payloads.length; i += 100) {
            const chunk = payloads.slice(i, i + 100);
            const inserted = await db.insert(rawScrapedEvents).values(chunk).returning();
            await normalizationQueue.addBulk(
              inserted.map((row) => ({ name: 'normalize', data: { rawId: row.id } })),
            );
          }
        }
        logger.info(`Scraped ${upcoming.length} events from Codeforces`);
      } else if (job.data.platform === 'leetcode') {
        const res = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query { allContests { title titleSlug startTime duration } }`,
          }),
        });
        const data = await res.json();
        const upcoming = data.data?.allContests || [];

        if (upcoming.length > 0) {
          const payloads = upcoming.map((contest: any) => ({
            sourcePlatformId: 'leetcode',
            sourceUrl: `https://leetcode.com/contest/${contest.titleSlug}`,
            rawPayload: contest,
          }));

          const inserted = await db.insert(rawScrapedEvents).values(payloads).returning();
          await normalizationQueue.addBulk(
            inserted.map((row) => ({ name: 'normalize', data: { rawId: row.id } })),
          );
        }
        logger.info(`Scraped ${upcoming.length} events from LeetCode`);
      } else if (job.data.platform === 'unstop') {
        const scraped = await scrapeUnstop();
        const inserted = await persistScrapedEvents(scraped);
        logger.info(`Scraped ${inserted} events from Unstop`);
      } else if (job.data.platform === 'devpost' || job.data.platform === 'devfolio') {
        const scraped = await scrapeDevpost();
        const inserted = await persistScrapedEvents(scraped);
        logger.info(`Scraped ${inserted} events from Devpost`);
      } else if (job.data.platform === 'atcoder') {
        const scraped = await scrapeAtcoder();
        const inserted = await persistScrapedEvents(scraped);
        logger.info(`Scraped ${inserted} events from AtCoder`);
      } else if (job.data.platform === 'codechef') {
        const scraped = await scrapeCodechef();
        const inserted = await persistScrapedEvents(scraped);
        logger.info(`Scraped ${inserted} events from CodeChef`);
      } else if (job.data.platform === 'geeksforgeeks') {
        const scraped = await scrapeGeeksforgeeks();
        const inserted = await persistScrapedEvents(scraped);
        logger.info(`Scraped ${inserted} events from GeeksforGeeks`);
      } else if (job.data.platform === 'mlh') {
        const scraped = await scrapeMlh();
        const inserted = await persistScrapedEvents(scraped);
        logger.info(`Scraped ${inserted} events from MLH`);
      }
    },
    { connection, concurrency: 2 },
  );

  // 2. Normalization Worker
  new Worker(
    QUEUES.NORMALIZATION,
    async (job) => {
      logger.info({ jobId: job.id, rawId: job.data.rawId }, 'Normalizing raw event');
      const raw = await db
        .select()
        .from(rawScrapedEvents)
        .where(sql`${rawScrapedEvents.id} = ${job.data.rawId}`)
        .limit(1);
      if (!raw[0]) return;

      const payload = raw[0].rawPayload as any;
      let canonical;

      if (raw[0].sourcePlatformId === 'codeforces') {
        canonical = {
          title: payload.name,
          description: `Codeforces Contest ${payload.id}`,
          startTime: new Date(payload.startTimeSeconds * 1000),
          endTime: new Date((payload.startTimeSeconds + payload.durationSeconds) * 1000),
          canonicalUrl: raw[0].sourceUrl,
          platformId: raw[0].sourcePlatformId,
        };
      } else if (raw[0].sourcePlatformId === 'leetcode') {
        canonical = {
          title: payload.title,
          description: `LeetCode Contest`,
          startTime: new Date(payload.startTime * 1000),
          endTime: new Date((payload.startTime + payload.duration) * 1000),
          canonicalUrl: raw[0].sourceUrl,
          platformId: raw[0].sourcePlatformId,
        };
      } else if (raw[0].sourcePlatformId === 'hackerrank') {
        canonical = {
          title: payload.title || 'HackerRank Challenge',
          description: payload.description || 'HackerRank Event',
          startTime: payload.startTime ? new Date(payload.startTime) : new Date(),
          endTime: payload.endTime ? new Date(payload.endTime) : null,
          canonicalUrl: payload.canonicalUrl || raw[0].sourceUrl,
          platformId: raw[0].sourcePlatformId,
        };
      } else if (raw[0].sourcePlatformId === 'unstop' || raw[0].sourcePlatformId === 'devpost') {
        canonical = {
          title: payload.title || raw[0].sourcePlatformId,
          description:
            payload.description ||
            payload.detailText ||
            payload.listingText ||
            `${raw[0].sourcePlatformId} event`,
          startTime: payload.startTime ? new Date(payload.startTime) : new Date(),
          endTime: payload.endTime ? new Date(payload.endTime) : null,
          canonicalUrl: raw[0].sourceUrl,
          platformId: raw[0].sourcePlatformId,
        };
      } else if (
        raw[0].sourcePlatformId === 'atcoder' ||
        raw[0].sourcePlatformId === 'codechef' ||
        raw[0].sourcePlatformId === 'geeksforgeeks' ||
        raw[0].sourcePlatformId === 'mlh'
      ) {
        canonical = {
          title: payload.title || raw[0].sourcePlatformId,
          description:
            payload.description ||
            payload.listingText ||
            payload.pageText ||
            `${raw[0].sourcePlatformId} event`,
          startTime: payload.startTime ? new Date(payload.startTime) : new Date(),
          endTime: payload.endTime ? new Date(payload.endTime) : null,
          canonicalUrl: payload.canonicalUrl || raw[0].sourceUrl,
          platformId: raw[0].sourcePlatformId,
        };
      } else {
        logger.warn({ platform: raw[0].sourcePlatformId }, 'Unknown platform in normalizer');
        return;
      }

      await db
        .update(rawScrapedEvents)
        .set({ normalized: true })
        .where(sql`${rawScrapedEvents.id} = ${job.data.rawId}`);
      await dedupeQueue.add('dedupe', { canonical });
    },
    { connection, concurrency: 20 },
  );

  // 3. Dedupe Worker
  new Worker(
    QUEUES.DEDUPE,
    async (job) => {
      const ev = job.data.canonical;
      logger.info({ title: ev.title }, 'Deduping event');

      const dedupeHash = crypto
        .createHash('sha256')
        .update(`${ev.platformId}-${ev.title}-${ev.startTime}`)
        .digest('hex');

      const [inserted] = await db
        .insert(events)
        .values({
          title: ev.title,
          description: ev.description,
          startTime: new Date(ev.startTime),
          endTime: ev.endTime ? new Date(ev.endTime) : null,
          canonicalUrl: ev.canonicalUrl,
          dedupeHash,
        })
        .onConflictDoUpdate({
          target: events.dedupeHash,
          set: { title: ev.title }, // basic upsert
        })
        .returning();

      await indexingQueue.add('index', { eventId: inserted.id, canonical: ev });
    },
    { connection, concurrency: 20 },
  );

  // 4. Indexing Worker
  new Worker(
    QUEUES.INDEXING,
    async (job) => {
      const { eventId, canonical } = job.data;
      logger.info({ eventId }, 'Indexing event for search');

      await db
        .insert(searchDocuments)
        .values({
          id: eventId,
          title: canonical.title,
          descriptionText: canonical.description,
          startTime: new Date(canonical.startTime),
          platformsJson: [canonical.platformId],
          tagsJson: ['competitive-programming'],
        })
        .onConflictDoNothing();
    },
    { connection, concurrency: 20 },
  );

  logger.info('All workers initialized and listening to queues.');

  // Trigger initial scrape for codeforces so we have data
  const { scrapingQueue } = await import('@eventio/queue');
  await scrapingQueue.add('manual-scrape', { platform: 'unstop' });
  await scrapingQueue.add('manual-scrape', { platform: 'devpost' });
  await scrapingQueue.add('manual-scrape', { platform: 'codeforces' });
  await scrapingQueue.add('manual-scrape', { platform: 'leetcode' });
  await scrapingQueue.add('manual-scrape', { platform: 'hackerrank' });
  await scrapingQueue.add('manual-scrape', { platform: 'atcoder' });
  await scrapingQueue.add('manual-scrape', { platform: 'codechef' });
  await scrapingQueue.add('manual-scrape', { platform: 'geeksforgeeks' });
  await scrapingQueue.add('manual-scrape', { platform: 'mlh' });
  import('./scheduler');
};

startWorkers();
