const postgres = require('postgres');
(async () => {
  try {
    const sqlUrl = process.env.DATABASE_URL || '';
    if (!sqlUrl) {
      console.error('DATABASE_URL not set');
      
      process.exit(1);
    }
    const sql = postgres(sqlUrl, { ssl: false });
    const rows =
      await sql`select id, source_platform_id, raw_payload->>'platform' as platform, (raw_payload->>'title') as title, normalized from raw_scraped_events where source_platform_id in ('unstop','devpost') order by scraped_at desc limit 20`;
    console.log(JSON.stringify(rows, null, 2));
    await sql.end();
  } catch (err) {
    console.error('Query error', err);
    process.exit(1);
  }
})();
