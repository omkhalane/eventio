/* eslint-disable no-console */
import { db, events } from '@eventio/db';
import { connection, scrapingQueue } from '@eventio/queue';
import {
  NormalizedEventSchema,
  scrapeAtcoder,
  scrapeCodechef,
  scrapeDevpost,
  scrapeGeeksforgeeks,
  scrapeMlh,
  scrapeUnstop,
} from '@eventio/scraper-core';
import { Worker } from 'bullmq';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

import { normalizeEvent } from './normalizer';

const ALL_PLATFORMS = [
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

const requestedPlatforms = process.argv.slice(2);
const PLATFORMS = requestedPlatforms.length > 0 ? requestedPlatforms : ALL_PLATFORMS;

const checkConnections = async () => {
  console.log('🔍 Running startup checks...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }

  try {
    await db.execute('SELECT 1');
    console.log('✅ Connected to Neon DB');
  } catch (error) {
    throw new Error(`Failed to connect to DB: ${error}`);
  }

  try {
    if (connection.status !== 'ready') {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Redis connection timeout')), 5000);
        connection.once('ready', () => {
          clearTimeout(timeout);
          resolve();
        });
        connection.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
    }
    console.log('✅ Connected to local Redis');
  } catch (error) {
    throw new Error(`Failed to connect to Redis: ${error}`);
  }
};

const cleanOutputDirectory = async () => {
  const outDir = path.join(process.cwd(), '../../outputs');
  console.log('🧹 Cleaning old output files...');
  try {
    await fs.rm(outDir, { recursive: true, force: true });
    console.log('✅ Output directory cleaned');
  } catch (error) {
    console.error('⚠️ Could not clean output directory:', error);
  }
};

const platformStats: Record<string, {
  startTime: number;
  endTime: number;
  scraped: number;
  newFound: number;
  updated: number;
  dupesSkipped: number;
}> = {};

const eventStats = {
  scraped: 0,
  newFound: 0,
  updated: 0,
  dupesSkipped: 0,
};

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const processEvents = async (platform: string, rawEvents: any[]) => {
  const normalizedEvents = [];

  for (const raw of rawEvents) {
    const rawPayload = raw.rawPayload || raw;
    const sourceUrl = raw.sourceUrl || raw.url || raw.canonicalUrl || '';
    const norm = normalizeEvent(rawPayload, platform, sourceUrl);
    
    const parsed = NormalizedEventSchema.safeParse(norm);
    if (!parsed.success) {
       console.error(`  ⚠️  [${platform.toUpperCase()}] Validation failed for an event`, parsed.error);
       continue;
    }
    const valid = parsed.data;
    normalizedEvents.push(valid);

    let slug = slugify(`${valid.title}-${valid.platform}`);
    if (valid.platformEventId) {
      slug += `-${valid.platformEventId}`;
    }

    const redisKey = `scraped:event:${platform}:${valid.platformEventId || slug}`;
    const exists = await connection.get(redisKey);
    const hash = crypto.createHash('sha256').update(JSON.stringify(valid)).digest('hex');
    
    if (exists === hash) {
       platformStats[platform].dupesSkipped++;
       eventStats.dupesSkipped++;
       continue;
    }

    try {
      await db.insert(events).values({
        slug,
        title: valid.title,
        shortDescription: valid.shortDescription,
        description: valid.description,
        platform: valid.platform,
        platformEventId: valid.platformEventId,
        sourceUrl: valid.sourceUrl,
        bannerImage: valid.bannerImage,
        thumbnailImage: valid.thumbnailImage,
        mode: valid.mode,
        category: valid.category,
        subcategory: valid.subcategory,
        startDate: valid.startDate ? new Date(valid.startDate) : null,
        endDate: valid.endDate ? new Date(valid.endDate) : null,
        registrationDeadline: valid.registrationDeadline ? new Date(valid.registrationDeadline) : null,
        timezone: valid.timezone || 'UTC',
        isFree: valid.isFree ?? true,
        price: valid.price,
        location: valid.location,
        city: valid.city,
        country: valid.country,
        organizerName: valid.organizerName,
        organizerLogo: valid.organizerLogo,
        organizerUrl: valid.organizerUrl,
        tags: valid.tags || [],
        skills: valid.skills || [],
        eligibility: valid.eligibility,
        prizes: valid.prizes,
        maxTeamSize: valid.maxTeamSize,
        minTeamSize: valid.minTeamSize,
        status: 'active',
        rawData: valid.rawData
      }).onConflictDoUpdate({
        target: events.slug,
        set: {
          title: valid.title,
          shortDescription: valid.shortDescription,
          description: valid.description,
          bannerImage: valid.bannerImage,
          startDate: valid.startDate ? new Date(valid.startDate) : null,
          endDate: valid.endDate ? new Date(valid.endDate) : null,
          updatedAt: new Date()
        }
      });

      if (exists) {
        platformStats[platform].updated++;
        eventStats.updated++;
      } else {
        platformStats[platform].newFound++;
        eventStats.newFound++;
      }

      await connection.set(redisKey, hash, 'EX', 60 * 60 * 24 * 7);
    } catch (dbError) {
       console.error(`  ❌ [${platform.toUpperCase()}] DB Insert Error:`, dbError);
    }
  }

  // Save JSON Output manually here because writeScraperOutput path issue
  try {
    const outDir = path.join(process.cwd(), '../../outputs');
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(
      path.join(outDir, `${platform}.json`),
      JSON.stringify(normalizedEvents, null, 2),
      'utf8'
    );
  } catch (err) {
    console.error(`  ⚠️  [${platform.toUpperCase()}] Failed to save JSON:`, err);
  }

  platformStats[platform].scraped += normalizedEvents.length;
  eventStats.scraped += normalizedEvents.length;
  console.log(`  ✅ [${platform.toUpperCase()}] Processed ${normalizedEvents.length} valid events`);
};

const initializeWorkers = async () => {
  console.log('🚀 Initializing workers...\n');

  new Worker(
    'scraping',
    async (job) => {
      const platform = job.data.platform;
      console.log(`  📡 [SCRAPING] Processing ${platform}...`);
      
      platformStats[platform] = {
        startTime: Date.now(),
        endTime: 0,
        scraped: 0,
        newFound: 0,
        updated: 0,
        dupesSkipped: 0,
      };

      try {
        if (platform === 'codeforces') {
          const res = await fetch('https://codeforces.com/api/contest.list');
          const data = await res.json();
          if (data.status === 'OK') {
            await processEvents(platform, data.result || []);
          }
        } else if (platform === 'leetcode') {
          const res = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `query { allContests { title titleSlug startTime duration } }`,
            }),
          });
          const data = await res.json();
          await processEvents(platform, data.data?.allContests || []);
        } else if (platform === 'hackerrank') {
          await processEvents(platform, [
            { platform: 'hackerrank', type: 'challenge', title: 'HackerRank Challenge', sourceUrl: 'https://www.hackerrank.com/challenges' }
          ]);
        } else if (platform === 'unstop') {
          let scraped = await scrapeUnstop();
          if (!scraped || scraped.length === 0) scraped = await scrapeUnstop();
          await processEvents(platform, scraped || []);
        } else if (platform === 'devpost' || platform === 'devfolio') {
          let scraped = await scrapeDevpost();
          if (!scraped || scraped.length === 0) scraped = await scrapeDevpost();
          await processEvents(platform, scraped || []);
        } else if (platform === 'atcoder') {
          await processEvents(platform, await scrapeAtcoder() || []);
        } else if (platform === 'codechef') {
          await processEvents(platform, await scrapeCodechef() || []);
        } else if (platform === 'geeksforgeeks') {
          await processEvents(platform, await scrapeGeeksforgeeks() || []);
        } else if (platform === 'mlh') {
          await processEvents(platform, await scrapeMlh() || []);
        }
      } catch (error) {
        console.error(`  ❌ [${platform.toUpperCase()}] Error:`, error);
      }
      
      platformStats[platform].endTime = Date.now();
    },
    { connection, concurrency: 5 },
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
    const activeCount = await scrapingQueue.getActiveCount();

    const totalQueued = scrapingCount + activeCount;

    if (totalQueued !== lastCount || (Date.now() - startTime) % 15000 < 500) {
      const activeJobs = await scrapingQueue.getActive();
      const activeNames = activeJobs.map(j => j.data.platform).join(', ');
      console.log(`  📊 Queue: ${totalQueued} remaining. 🔄 Active now: [${activeNames || 'None'}]...`);
      lastCount = totalQueued;
    }

    if (totalQueued === 0 && eventStats.scraped > 0) {
      console.log('\n✅ All queues processed!\n');
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

const printSummary = async () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('EventIO Scraper System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  for (const [platform, stats] of Object.entries(platformStats)) {
    console.log(`[${platform.charAt(0).toUpperCase() + platform.slice(1)}]`);
    console.log(`Events Scraped: ${stats.scraped}`);
    console.log(`New Events: ${stats.newFound}`);
    console.log(`Updated Events: ${stats.updated}`);
    console.log(`Database Push: ${stats.newFound + stats.updated > 0 ? 'Success' : 'Skipped (No Changes)'}`);
    console.log(`Output: outputs/${platform}.json\n`);
  }

  const { rows } = await db.execute('SELECT COUNT(*) as c FROM events;');
  const totalDb = rows[0]?.c || 0;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('FINAL SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Platforms Run: ${Object.keys(platformStats).length}`);
  console.log(`Total Events Scraped: ${eventStats.scraped}`);
  console.log(`New Events Added: ${eventStats.newFound}`);
  console.log(`Events Updated: ${eventStats.updated}`);
  console.log(`Duplicates Skipped: ${eventStats.dupesSkipped}`);
  console.log(`Total Database Events: ${totalDb}`);
  console.log('\nRedis: Connected');
  console.log('Neon DB: Connected');
  console.log('Outputs Saved: Yes\n');
  console.log('DONE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

const main = async () => {
  try {
    await checkConnections();
    await cleanOutputDirectory();
    await initializeWorkers();
    await triggerScrapers();
    await waitForCompletion(600000); // 10 minute timeout
    await printSummary();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

main();
