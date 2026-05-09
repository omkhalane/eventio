import { Worker, QUEUES, connection, normalizationQueue, dedupeQueue, indexingQueue } from '@eventio/queue';
import { logger } from '@eventio/observability';
import { db, rawScrapedEvents, events, searchDocuments } from '@eventio/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const startWorkers = async () => {
  logger.info('Starting worker processes...');

  // 1. Scraping Worker
  new Worker(QUEUES.SCRAPING, async (job) => {
    logger.info({ jobId: job.id, platform: job.data.platform }, 'Processing scrape job');
    if (job.data.platform === 'codeforces') {
      const res = await fetch('https://codeforces.com/api/contest.list');
      const data = await res.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Codeforces API error: ${data.comment}`);
      }

      // Grab some contests (even FINISHED) to guarantee we have data in the UI
      const upcoming = data.result.slice(0, 10);
      
      for (const contest of upcoming) {
        const [inserted] = await db.insert(rawScrapedEvents).values({
          sourcePlatformId: 'codeforces',
          sourceUrl: `https://codeforces.com/contests/${contest.id}`,
          rawPayload: contest,
        }).returning();
        await normalizationQueue.add('normalize', { rawId: inserted.id });
      }
      logger.info(`Scraped ${upcoming.length} events from Codeforces`);
    } else if (job.data.platform === 'leetcode') {
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { allContests { title titleSlug startTime duration } }`
        })
      });
      const data = await res.json();
      const contests = data.data?.allContests || [];
      const upcoming = contests.slice(0, 5); // Grab a few recent
      for (const contest of upcoming) {
        const [inserted] = await db.insert(rawScrapedEvents).values({
          sourcePlatformId: 'leetcode',
          sourceUrl: `https://leetcode.com/contest/${contest.titleSlug}`,
          rawPayload: contest,
        }).returning();
        await normalizationQueue.add('normalize', { rawId: inserted.id });
      }
      logger.info(`Scraped ${upcoming.length} events from LeetCode`);
    }
  }, { connection, concurrency: 1 });

  // 2. Normalization Worker
  new Worker(QUEUES.NORMALIZATION, async (job) => {
    logger.info({ jobId: job.id, rawId: job.data.rawId }, 'Normalizing raw event');
    const raw = await db.select().from(rawScrapedEvents).where(eq(rawScrapedEvents.id, job.data.rawId)).limit(1);
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
    } else {
      logger.warn({ platform: raw[0].sourcePlatformId }, 'Unknown platform in normalizer');
      return;
    }

    await db.update(rawScrapedEvents).set({ normalized: true }).where(eq(rawScrapedEvents.id, job.data.rawId));
    await dedupeQueue.add('dedupe', { canonical });
  }, { connection, concurrency: 10 });

  // 3. Dedupe Worker
  new Worker(QUEUES.DEDUPE, async (job) => {
    const ev = job.data.canonical;
    logger.info({ title: ev.title }, 'Deduping event');
    
    const dedupeHash = crypto.createHash('sha256').update(`${ev.platformId}-${ev.title}-${ev.startTime}`).digest('hex');
    
    const [inserted] = await db.insert(events).values({
      title: ev.title,
      description: ev.description,
      startTime: new Date(ev.startTime),
      endTime: ev.endTime ? new Date(ev.endTime) : null,
      canonicalUrl: ev.canonicalUrl,
      dedupeHash,
    }).onConflictDoUpdate({
      target: events.dedupeHash,
      set: { title: ev.title } // basic upsert
    }).returning();

    await indexingQueue.add('index', { eventId: inserted.id, canonical: ev });
  }, { connection, concurrency: 5 });

  // 4. Indexing Worker
  new Worker(QUEUES.INDEXING, async (job) => {
    const { eventId, canonical } = job.data;
    logger.info({ eventId }, 'Indexing event for search');
    
    await db.insert(searchDocuments).values({
      id: eventId,
      title: canonical.title,
      descriptionText: canonical.description,
      startTime: new Date(canonical.startTime),
      platformsJson: [canonical.platformId],
      tagsJson: ['competitive-programming']
    }).onConflictDoNothing();
  }, { connection, concurrency: 5 });

  logger.info('All workers initialized and listening to queues.');
  
  // Trigger initial scrape for codeforces so we have data
  const { scrapingQueue } = await import('@eventio/queue');
  await scrapingQueue.add('manual-scrape', { platform: 'codeforces' });
  await scrapingQueue.add('manual-scrape', { platform: 'leetcode' });
  import('./scheduler');
};

startWorkers();
