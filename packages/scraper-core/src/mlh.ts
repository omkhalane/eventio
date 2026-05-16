import type { ScrapedEventRecord } from './types.js';
import { createBrowser, createPage } from './browser.js';
import { cleanText, uniqueBy } from './utils.js';
import { writeScraperOutput } from './output.js';

const MONTH_LOOKUP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};


const discoverMlhYears = async () => {
  try {
    const response = await fetch('https://www.mlh.com/seasons', {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
    });
    const html = await response.text();
    const years = Array.from(html.matchAll(/\/seasons\/(\d{4})\/events/gi))
      .map((m) => Number(m[1]))
      .filter((year) => Number.isFinite(year));

    const uniqueYears = [...new Set(years)].sort((a, b) => b - a);
    if (uniqueYears.length > 0) {
      return uniqueYears;
    }
  } catch {
    // fallback below
  }

  const currentYear = new Date().getUTCFullYear();
  const fallback: number[] = [];
  for (let year = currentYear; year >= 2010; year -= 1) {
    fallback.push(year);
  }

  return fallback;
};

const parseMlhDateRange = (value: string, year: number) => {
  const match = value.match(
    /\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b\s+(\d{1,2})\s+-\s+(\d{1,2})/i,
  );
  if (!match) {
    return null;
  }

  const month = MONTH_LOOKUP[match[1].slice(0, 3).toLowerCase()];
  if (month === undefined) {
    return null;
  }

  const startTime = new Date(Date.UTC(year, month, Number(match[2])));
  const endTime = new Date(Date.UTC(year, month, Number(match[3]), 23, 59, 59));

  return { startTime, endTime };
};

const scrapeYear = async (year: number) => {
  const browser = await createBrowser();
  const page = await createPage(browser);

  try {
    await page.goto(`https://www.mlh.com/seasons/${year}/events`, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    await page.waitForTimeout(1_000);

    const anchorLocator = page.locator('a[href]');
    const anchorCount = await anchorLocator.count();
    const anchors: Array<{ href: string; text: string }> = [];

    for (let index = 0; index < anchorCount; index += 1) {
      const anchor = anchorLocator.nth(index);
      const href = await anchor.getAttribute('href');
      if (!href) {
        continue;
      }

      anchors.push({
        href: new URL(href, page.url()).href,
        text: (await anchor.innerText()).replace(/\s+/g, ' ').trim(),
      });
    }

    const cards = uniqueBy(
      anchors.filter((anchor) =>
        /\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b\s+\d{1,2}\s+-\s+\d{1,2}/i.test(
          anchor.text,
        ),
      ),
      (anchor) => `${anchor.href}::${anchor.text}`,
    );

    return cards.map((card) => ({
      year,
      href: card.href,
      text: card.text,
    }));
  } finally {
    await page.close();
    await browser.close();
  }
};

export async function scrapeMlh(): Promise<ScrapedEventRecord[]> {
  const cards: Array<{ year: number; href: string; text: string }> = [];

  const years = await discoverMlhYears();
  for (const year of years) {
    const yearCards = await scrapeYear(year);
    cards.push(...yearCards);
  }

  const dedupedCards = uniqueBy(cards, (card) => card.href);

  const results = dedupedCards.map((card) => {
    const titleMatch = card.text.match(
      /^(.*?)(?:\s+\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b\s+\d{1,2}\s+-\s+\d{1,2})/i,
    );
    const title = cleanText(titleMatch?.[1] || card.text);
    const dateRange = parseMlhDateRange(card.text, card.year);

    return {
      sourcePlatformId: 'mlh',
      sourceUrl: card.href,
      rawPayload: {
        platform: 'mlh',
        title,
        description: card.text,
        listingText: card.text,
        startTime: dateRange?.startTime.toISOString() || null,
        endTime: dateRange?.endTime.toISOString() || null,
        canonicalUrl: card.href,
        seasonYear: card.year,
      },
    };
  });
  return results;
}
