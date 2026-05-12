import type { ScrapedEventRecord } from './types';
import { collectAnchors, createBrowser, createPage } from './browser';
import { cleanText, uniqueBy } from './utils';
import { writeScraperOutput } from './output';

const CODECHEF_URL = 'https://www.codechef.com/contests';

const parseCodeChefDate = (value: string) => {
  const match = value.match(
    /([A-Za-z]+),\s+(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+),\s+(\d{4})\s+at\s+(\d{1,2}):(\d{2})\s+HRS\s+\(IST\)/i,
  );
  if (!match) {
    return null;
  }

  const monthLookup: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  const month = monthLookup[match[3].toLowerCase()];
  if (month === undefined) {
    return null;
  }

  const utc = Date.UTC(
    Number(match[4]),
    month,
    Number(match[2]),
    Number(match[5]),
    Number(match[6]),
  );
  return new Date(utc - 5.5 * 60 * 60 * 1000);
};

const getContestLinks = async () => {
  const browser = await createBrowser();
  const page = await createPage(browser);

  try {
    await page.goto(CODECHEF_URL, { waitUntil: 'domcontentloaded', timeout: 120_000 });
    for (let index = 0; index < 10; index += 1) {
      await page.mouse.wheel(0, 10_000);
      await page.waitForTimeout(600);
    }

    const anchors = await collectAnchors(page);
    return uniqueBy(
      anchors.filter((anchor) => {
        try {
          const url = new URL(anchor.href);
          const isCodeChef = url.hostname === 'www.codechef.com' || url.hostname === 'codechef.com';
          const path = url.pathname;
          const looksLikeContest = /^\/[A-Za-z0-9][A-Za-z0-9_-]*$/.test(path);
          const isUtilityRoute =
            path.startsWith('/contest') ||
            path.startsWith('/practice') ||
            path.startsWith('/roadmap') ||
            path.startsWith('/skill-test') ||
            path.startsWith('/blogs') ||
            path.startsWith('/login') ||
            path.startsWith('/signup') ||
            path.startsWith('/compiler') ||
            path.startsWith('/ide');

          return isCodeChef && looksLikeContest && !isUtilityRoute;
        } catch {
          return false;
        }
      }),
      (anchor) => anchor.href,
    );
  } finally {
    await page.close();
    await browser.close();
  }
};

const fetchContestDetail = async (contestUrl: string, listingText: string) => {
  const browser = await createBrowser();
  const page = await createPage(browser);

  try {
    try {
      await page.goto(contestUrl, { waitUntil: 'domcontentloaded', timeout: 180_000 });
      await page.waitForTimeout(500);
    } catch {
      const fallbackTitle = cleanText(listingText || contestUrl);
      const fallbackTime = new Date().toISOString();

      return {
        sourcePlatformId: 'codechef',
        sourceUrl: contestUrl,
        rawPayload: {
          platform: 'codechef',
          title: fallbackTitle,
          description: fallbackTitle,
          startTime: fallbackTime,
          endTime: fallbackTime,
          canonicalUrl: contestUrl,
          contestCode: new URL(contestUrl).pathname.replace(/^\//, ''),
        },
      };
    }

    const bodyText = cleanText(await page.locator('body').innerText());
    const h1Count = await page.locator('h1').count();
    const h1Text = h1Count > 0 ? await page.locator('h1').first().textContent() : null;
    const title = cleanText(
      h1Text || (await page.title().catch(() => '')) || listingText || contestUrl,
    );

    const startText = bodyText.match(/Start Date:\s*(.+?)\s+End Date:/i)?.[1] || '';
    const endText = bodyText.match(/End Date:\s*(.+?)\s+Check your timezone/i)?.[1] || '';

    const fallbackTime = new Date().toISOString();
    const startTime =
      parseCodeChefDate(startText) || parseCodeChefDate(endText) || new Date(fallbackTime);
    const endTime = parseCodeChefDate(endText) || parseCodeChefDate(startText) || startTime;

    return {
      sourcePlatformId: 'codechef',
      sourceUrl: contestUrl,
      rawPayload: {
        platform: 'codechef',
        title,
        description: cleanText(bodyText.slice(0, 4000)),
        startTime: startTime ? startTime.toISOString() : fallbackTime,
        endTime: endTime ? endTime.toISOString() : fallbackTime,
        canonicalUrl: contestUrl,
        contestCode: new URL(contestUrl).pathname.replace(/^\//, ''),
      },
    };
  } finally {
    await page.close();
    await browser.close();
  }
};

export async function scrapeCodechef(): Promise<ScrapedEventRecord[]> {
  const listingLinks = await getContestLinks();

  const results = await Promise.all(
    listingLinks.map(async (anchor) => fetchContestDetail(anchor.href, anchor.text)),
  );

  await writeScraperOutput('codechef', results);
  return results;
}
