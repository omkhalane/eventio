import fs from 'fs/promises';
import path from 'path';

export const writeScraperOutput = async (platform: string, records: unknown[]) => {
  try {
    const outDir = path.join(process.cwd(), 'scraper-output');
    await fs.mkdir(outDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${platform}-${timestamp}.json`;
    const fullPath = path.join(outDir, filename);

    await fs.writeFile(
      fullPath,
      JSON.stringify(
        { platform, generatedAt: new Date().toISOString(), count: records.length, records },
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
