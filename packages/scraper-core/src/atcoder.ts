import { collectAnchors, createBrowser, createPage } from './browser';
import type { ScrapedEventRecord } from './types';
import { cleanText, uniqueBy } from './utils';
import { writeScraperOutput } from './output';

const ATCODER_TOKYO_OFFSET_MS = 9 * 60 * 60 * 1000;
const ATCODER_BASE_URL = 'https://atcoder.jp/contests/archive?lang=en';
const ATCODER_CURRENT_URL = 'https://atcoder.jp/contests/?lang=en';

const parseAtCoderDateTime = (value: string) => {
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})\([A-Za-z]{3}\)\s+(\d{2}):(\d{2})/);
  if (!match) {
    return null;
  }

  return new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
    ) - ATCODER_TOKYO_OFFSET_MS,
  );
};

const parseDuration = (value: string) => {
  const match = value.match(/(\d+):(\d{2})/);
  if (!match) {
    return null;
  }

  return (Number(match[1]) * 60 + Number(match[2])) * 60_000;
};

const extractRows = async (pageUrl: string) => {
  const browser = await createBrowser();
  const page = await createPage(browser);

  try {
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    await page.waitForTimeout(500);

    const pageAnchors = await collectAnchors(page);
    const pageNumbers = pageAnchors
      .map((anchor) => anchor.href.match(/page=(\d+)/)?.[1])
      .filter((value): value is string => Boolean(value))
      .map(Number);

    const rowLocator = page.locator('table tbody tr');
    const rowCount = await rowLocator.count();
    const rows: Array<{ cells: string[]; text: string; href: string }> = [];

    for (let index = 0; index < rowCount; index += 1) {
      const row = rowLocator.nth(index);
      const text = (await row.innerText()).replace(/\s+/g, ' ').trim();
      if (!/\d{4}-\d{2}-\d{2}\([A-Za-z]{3}\)/.test(text)) {
        continue;
      }

      const cellLocator = row.locator('td');
      const cellCount = await cellLocator.count();
      const cells: string[] = [];
      for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
        cells.push(
          ((await cellLocator.nth(cellIndex).innerText()) || '').replace(/\s+/g, ' ').trim(),
        );
      }

      const link = row.locator('a[href]').first();
      const href = await link.getAttribute('href');
      if (href) {
        rows.push({
          cells,
          text,
          href: new URL(href, page.url()).href,
        });
      }
    }

    return {
      rows,
      pageNumbers,
    };
  } finally {
    await page.close();
    await browser.close();
  }
};

export async function scrapeAtcoder(): Promise<ScrapedEventRecord[]> {
  const discoveredRows: Array<{
    href: string;
    cells: string[];
    text: string;
    sourcePage: string;
  }> = [];

  const seenPages = new Set<string>();
  const visitQueue = [ATCODER_BASE_URL, ATCODER_CURRENT_URL];
  let maxPage = 1;

  while (visitQueue.length > 0) {
    const pageUrl = visitQueue.shift();
    if (!pageUrl || seenPages.has(pageUrl)) {
      continue;
    }

    seenPages.add(pageUrl);
    const { rows, pageNumbers } = await extractRows(pageUrl);
    discoveredRows.push(...rows.map((row) => ({ ...row, sourcePage: pageUrl })));

    for (const pageNumber of pageNumbers) {
      if (pageNumber > maxPage) {
        maxPage = pageNumber;
      }
    }

    if (pageUrl === ATCODER_BASE_URL) {
      for (let pageNumber = 2; pageNumber <= maxPage; pageNumber += 1) {
        visitQueue.push(`https://atcoder.jp/contests/archive?lang=en&page=${pageNumber}`);
      }
    }

    if (pageUrl.startsWith('https://atcoder.jp/contests/archive?lang=en&page=')) {
      const currentPageNumber = Number(new URL(pageUrl).searchParams.get('page') || '1');
      if (currentPageNumber === maxPage) {
        for (let pageNumber = currentPageNumber + 1; pageNumber <= maxPage; pageNumber += 1) {
          visitQueue.push(`https://atcoder.jp/contests/archive?lang=en&page=${pageNumber}`);
        }
      }
    }
  }

  const dedupedRows = uniqueBy(discoveredRows, (row) => row.href);

  const results = dedupedRows.map((row) => {
    const startTime = parseAtCoderDateTime(row.cells[0] || row.text);
    const duration = parseDuration(row.cells[2] || row.text);

    return {
      sourcePlatformId: 'atcoder',
      sourceUrl: row.href,
      rawPayload: {
        platform: 'atcoder',
        title: cleanText(row.cells[1] || row.text),
        description: row.text,
        sourcePage: row.sourcePage,
        startTime: startTime ? startTime.toISOString() : null,
        endTime:
          startTime && duration ? new Date(startTime.getTime() + duration).toISOString() : null,
        duration: row.cells[2] || null,
        ratingRange: row.cells[3] || null,
        canonicalUrl: row.href,
      },
    };
  });
  return results;
}
