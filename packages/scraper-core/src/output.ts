import fs from 'fs/promises';
import path from 'path';

export const writeScraperOutput = async (platform: string, records: unknown[]) => {
  try {
    // Determine the repo root assuming this might be run from various places, but generally process.cwd() is root
    // Let's explicitly try to go up from current dirname or use process.cwd() /outputs
    const outDir = path.join(process.cwd(), 'outputs');
    await fs.mkdir(outDir, { recursive: true });

    const filename = `${platform}.json`;
    const fullPath = path.join(outDir, filename);

    await fs.writeFile(
      fullPath,
      JSON.stringify(
        { 
          platform, 
          scrapedAt: new Date().toISOString(), 
          count: records.length, 
          events: records 
        },
        null,
        2,
      ),
      'utf8',
    );
    return fullPath;
  } catch (error) {
    // Don't throw - writing output is best-effort debugging aid
    // eslint-disable-next-line no-console
    console.error('Failed to write scraper output file:', error);
    return null;
  }
};
