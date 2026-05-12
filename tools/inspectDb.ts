import { db, rawScrapedEvents } from '@eventio/db';

const main = async () => {
  const rows = await db.select().from(rawScrapedEvents).limit(10);

  console.log('\n📊 Raw Scraped Events Sample:');
  for (const row of rows) {
    console.log(`\n  Platform: ${row.sourcePlatformId}`);
    console.log(`  Source URL: ${row.sourceUrl}`);
    console.log(`  Normalized: ${row.normalized}`);
  }

  const platforms = await db
    .selectDistinct({ platform: rawScrapedEvents.sourcePlatformId })
    .from(rawScrapedEvents);

  console.log('\n📋 Platforms in Database:');
  for (const p of platforms) {
    console.log(`  - ${p.platform}`);
  }

  process.exit(0);
};

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
