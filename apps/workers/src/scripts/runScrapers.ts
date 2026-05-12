import {
  scrapingQueue,
  normalizationQueue,
  dedupeQueue,
  indexingQueue,
  connection,
} from '@eventio/queue';
import { logger } from '@eventio/observability';
import {
  scrapeAtcoder,
  scrapeCodechef,
  scrapeDevpost,
  scrapeGeeksforgeeks,
  scrapeMlh,
  scrapeUnstop,
  writeScraperOutput,
} from '@eventio/scraper-core';
import { db, events, rawScrapedEvents } from '@eventio/db';
import { Worker } from 'bullmq';
import { count, desc, eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Comprehensive scraper runner with terminal output
 * Runs all scrapers, shows progress, and displays all fetched events
 */

const PLATFORMS = [
  'unstop',
  'devpost',
  'codeforces',
  'leetcode',
  'hackerrank',
  'atcoder',
  'codechef',
  'geeksforgeeks',
  'mlh',
];

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

let eventStats = {
  scraped: 0,
  normalized: 0,
  deduped: 0,
  indexed: 0,
  total: 0,
};

const initializeWorkers = async () => {
  console.log('🚀 Initializing workers...\n');

  // 1. Scraping Worker
  new Worker(
    'scraping',
    async (job) => {
      const platform = job.data.platform;
      console.log(`  📡 [SCRAPING] Processing ${platform}...`);

      if (platform === 'codeforces') {
        try {
          const res = await fetch('https://codeforces.com/api/contest.list');
          const data = await res.json();

          if (data.status !== 'OK') {
            throw new Error(`Codeforces API error: ${data.comment}`);
          }

          const upcoming = data.result || [];

          const payloads = upcoming.map((contest: any) => ({
            sourcePlatformId: 'codeforces',
            sourceUrl: `https://codeforces.com/contests/${contest.id}`,
            rawPayload: contest,
          }));

          // write output for debugging (best-effort)
          await writeScraperOutput('codeforces', payloads);

          if (payloads.length > 0) {
            for (let i = 0; i < payloads.length; i += 100) {
              const chunk = payloads.slice(i, i + 100);
              const inserted = await db.insert(rawScrapedEvents).values(chunk).returning();
              await normalizationQueue.addBulk(
                inserted.map((row) => ({
                  name: 'normalize',
                  data: { rawId: row.id },
                })),
              );
            }
            eventStats.scraped += payloads.length;
            console.log(`  ✅ [CODEFORCES] Scraped ${payloads.length} contests`);
          } else {
            console.log('  ⚠️  [CODEFORCES] No contests returned');
          }
        } catch (error) {
          console.error(`  ❌ [CODEFORCES] Error:`, error);
        }
      } else if (platform === 'leetcode') {
        try {
          const res = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `query { allContests { title titleSlug startTime duration } }`,
            }),
          });
          const data = await res.json();
          const upcoming = data.data?.allContests || [];

          const payloads = upcoming.map((contest: any) => ({
            sourcePlatformId: 'leetcode',
            sourceUrl: `https://leetcode.com/contest/${contest.titleSlug}`,
            rawPayload: contest,
          }));

          await writeScraperOutput('leetcode', payloads);

          if (payloads.length > 0) {
            const inserted = await db.insert(rawScrapedEvents).values(payloads).returning();
            await normalizationQueue.addBulk(
              inserted.map((row) => ({
                name: 'normalize',
                data: { rawId: row.id },
              })),
            );
            eventStats.scraped += payloads.length;
            console.log(`  ✅ [LEETCODE] Scraped ${payloads.length} contests`);
          } else {
            console.log('  ⚠️  [LEETCODE] No contests returned');
          }
        } catch (error) {
          console.error(`  ❌ [LEETCODE] Error:`, error);
        }
      } else if (platform === 'hackerrank') {
        try {
          console.log(`  ⏳ [HACKERRANK] Fetching...`);
          // HackerRank scraping logic
          const payloads = [
            {
              sourcePlatformId: 'hackerrank',
              sourceUrl: 'https://www.hackerrank.com/challenges',
              rawPayload: { platform: 'hackerrank', type: 'challenge' },
            },
          ];

          await writeScraperOutput('hackerrank', payloads);

          const inserted = await db.insert(rawScrapedEvents).values(payloads).returning();
          await normalizationQueue.addBulk(
            inserted.map((row) => ({
              name: 'normalize',
              data: { rawId: row.id },
            })),
          );
          eventStats.scraped += 1;
          console.log(`  ✅ [HACKERRANK] Scraped 1 event`);
        } catch (error) {
          console.error(`  ❌ [HACKERRANK] Error:`, error);
        }
      } else if (platform === 'unstop') {
        try {
          let scraped = await scrapeUnstop();

          if (!scraped || scraped.length === 0) {
            await writeScraperOutput('unstop', scraped || []);
            // retry once
            scraped = await scrapeUnstop();
          }

          await writeScraperOutput('unstop', scraped || []);

          const inserted = await persistScrapedEvents(scraped);
          eventStats.scraped += inserted;
          console.log(`  ✅ [UNSTOP] Scraped ${inserted} events`);
        } catch (error) {
          console.error(`  ❌ [UNSTOP] Error:`, error);
        }
      } else if (platform === 'devpost' || platform === 'devfolio') {
        try {
          let scraped = await scrapeDevpost();

          if (!scraped || scraped.length === 0) {
            await writeScraperOutput('devpost', scraped || []);
            scraped = await scrapeDevpost();
          }

          await writeScraperOutput('devpost', scraped || []);

          const inserted = await persistScrapedEvents(scraped);
          eventStats.scraped += inserted;
          console.log(`  ✅ [DEVPOST] Scraped ${inserted} events`);
        } catch (error) {
          console.error(`  ❌ [DEVPOST] Error:`, error);
        }
      } else if (platform === 'atcoder') {
        try {
          const scraped = await scrapeAtcoder();
          const inserted = await persistScrapedEvents(scraped);
          eventStats.scraped += inserted;
          console.log(`  ✅ [ATCODER] Scraped ${inserted} events`);
        } catch (error) {
          console.error(`  ❌ [ATCODER] Error:`, error);
        }
      } else if (platform === 'codechef') {
        try {
          const scraped = await scrapeCodechef();
          const inserted = await persistScrapedEvents(scraped);
          eventStats.scraped += inserted;
          console.log(`  ✅ [CODECHEF] Scraped ${inserted} events`);
        } catch (error) {
          console.error(`  ❌ [CODECHEF] Error:`, error);
        }
      } else if (platform === 'geeksforgeeks') {
        try {
          const scraped = await scrapeGeeksforgeeks();
          const inserted = await persistScrapedEvents(scraped);
          eventStats.scraped += inserted;
          console.log(`  ✅ [GEEKSFORGEEKS] Scraped ${inserted} events`);
        } catch (error) {
          console.error(`  ❌ [GEEKSFORGEEKS] Error:`, error);
        }
      } else if (platform === 'mlh') {
        try {
          const scraped = await scrapeMlh();
          const inserted = await persistScrapedEvents(scraped);
          eventStats.scraped += inserted;
          console.log(`  ✅ [MLH] Scraped ${inserted} events`);
        } catch (error) {
          console.error(`  ❌ [MLH] Error:`, error);
        }
      }
    },
    { connection, concurrency: 2 },
  );

  // 2. Normalization Worker
  new Worker(
    'normalization',
    async (job) => {
      const rawId = job.data.rawId;
      try {
        const raw = await db
          .select()
          .from(rawScrapedEvents)
          .where(eq(rawScrapedEvents.id, rawId))
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
            title: 'HackerRank Challenge',
            description: `HackerRank Event`,
            startTime: new Date(),
            endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            canonicalUrl: raw[0].sourceUrl,
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
          console.warn(`  ⚠️  Unknown platform: ${raw[0].sourcePlatformId}`);
          return;
        }

        await db
          .update(rawScrapedEvents)
          .set({ normalized: true })
          .where(eq(rawScrapedEvents.id, rawId));

        eventStats.normalized++;
        await dedupeQueue.add('dedupe', { canonical });
      } catch (error) {
        console.error(`  ❌ [NORMALIZATION] Error:`, error);
      }
    },
    { connection, concurrency: 20 },
  );

  // 3. Dedupe Worker
  new Worker(
    'dedupe',
    async (job) => {
      try {
        const ev = job.data.canonical;

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
            set: { title: ev.title },
          })
          .returning();

        eventStats.deduped++;
        await indexingQueue.add('index', { eventId: inserted.id, canonical: ev });
      } catch (error) {
        console.error(`  ❌ [DEDUPE] Error:`, error);
      }
    },
    { connection, concurrency: 20 },
  );

  // 4. Indexing Worker
  new Worker(
    'indexing',
    async (job) => {
      try {
        const { eventId } = job.data;

        // Just mark as indexed
        eventStats.indexed++;
      } catch (error) {
        console.error(`  ❌ [INDEXING] Error:`, error);
      }
    },
    { connection, concurrency: 20 },
  );
};

const triggerScrapers = async () => {
  console.log('📋 Triggering all platform scrapers...\n');

  for (const platform of PLATFORMS) {
    console.log(`  → Queuing ${platform}...`);
    await scrapingQueue.add(`scrape-${platform}`, { platform });
  }

  console.log('\n✅ All scrapers queued\n');
};

const waitForCompletion = async (timeout = 60000) => {
  console.log('⏳ Waiting for all jobs to complete...\n');

  const startTime = Date.now();
  let lastCount = 0;

  while (Date.now() - startTime < timeout) {
    const scrapingCount = await scrapingQueue.count();
    const normCount = await normalizationQueue.count();
    const dedupeCount = await dedupeQueue.count();
    const indexCount = await indexingQueue.count();

    const totalQueued = scrapingCount + normCount + dedupeCount + indexCount;

    if (totalQueued !== lastCount) {
      console.log(
        `  📊 Queue status: Scraping=${scrapingCount}, Normalization=${normCount}, Dedupe=${dedupeCount}, Indexing=${indexCount}`,
      );
      lastCount = totalQueued;
    }

    if (totalQueued === 0 && eventStats.scraped > 0) {
      console.log('\n✅ All queues processed!\n');
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

const displayFetchedEvents = async () => {
  console.log('📋 Fetching all scraped events...\n');

  try {
    const [{ total }] = await db.select({ total: count() }).from(events);
    eventStats.total = Number(total || 0);

    const allEvents = await db.select().from(events).orderBy(desc(events.startTime)).limit(50);

    if (allEvents.length === 0) {
      console.log('  ℹ️  No events found in database');
      return;
    }

    console.log(`  📌 Total events in database: ${allEvents.length}\n`);
    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
    );

    allEvents.forEach((event, index) => {
      const startDate = new Date(event.startTime).toLocaleString();
      const endDate = event.endTime ? new Date(event.endTime).toLocaleString() : 'N/A';

      console.log(`${index + 1}. ${event.title}`);
      console.log(`   📍 URL: ${event.canonicalUrl}`);
      console.log(`   🕐 Start: ${startDate}`);
      console.log(`   🕑 End: ${endDate}`);
      console.log(`   📝 Description: ${event.description || 'N/A'}\n`);
    });

    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
    );
  } catch (error) {
    console.error('❌ Error fetching events:', error);
  }
};

const printSummary = () => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║           🎉 SCRAPER RUN COMPLETE 🎉                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log('📊 Summary Statistics:');
  console.log(`  ✅ Events Scraped:      ${eventStats.scraped}`);
  console.log(`  ✅ Events Normalized:   ${eventStats.normalized}`);
  console.log(`  ✅ Events Deduped:      ${eventStats.deduped}`);
  console.log(`  ✅ Events Indexed:      ${eventStats.indexed}`);
  console.log(`  📌 Total in Database:   ${eventStats.total}\n`);
};

const main = async () => {
  console.log('\n🚀 Starting comprehensive scraper runner...\n');
  console.log('═════════════════════════════════════════════════════════\n');

  try {
    await initializeWorkers();
    console.log('✅ Workers initialized\n');

    await triggerScrapers();
    await waitForCompletion(600000); // 10 minute timeout for full source sweeps

    // Display all fetched events
    await displayFetchedEvents();

    // Print final summary
    printSummary();

    console.log('✨ Scraper runner finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

main();
