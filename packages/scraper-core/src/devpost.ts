import { collectAnchors, createBrowser, createPage } from './browser.js';
import { writeScraperOutput } from './output.js';
import type { ScrapedEventRecord } from './types.js';
import { parseDateRangeFromText, parseDevpostDateRange, uniqueBy } from './utils.js';

const DEVPOST_BASE_URL = 'https://devpost.com/hackathons';
const DEVPOST_STALE_PAGE_THRESHOLD = 9999999; // effectively no limit

const DEVPOST_EXCLUDED_HOSTS = new Set([
  'devpost.com',
  'www.devpost.com',
  'secure.devpost.com',
  'help.devpost.com',
  'info.devpost.com',
]);

const stripTags = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isValidDevpostHackathonUrl = (href: string) => {
  try {
    const url = new URL(href);
    const isDevpost = url.hostname.endsWith('devpost.com');
    const isExcludedHost = DEVPOST_EXCLUDED_HOSTS.has(url.hostname);
    const isUtilityPath =
      url.pathname.startsWith('/users/') ||
      url.pathname.startsWith('/portfolio/') ||
      url.pathname.startsWith('/settings') ||
      url.pathname.startsWith('/software') ||
      url.pathname.startsWith('/hackathons');

    return isDevpost && !isExcludedHost && !isUtilityPath;
  } catch {
    return false;
  }
};

const canonicalizeUrl = (href: string) => {
  const url = new URL(href);
  url.hash = '';
  url.search = '';
  return url.href;
};

const extractLinksAndTextFromHtml = (html: string, pageUrl: string) => {
  const links = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi))
    .map((match) => ({ href: match[1], text: stripTags(match[2]) }))
    .map(({ href, text }) => {
      try {
        return { href: new URL(href, pageUrl).href, text };
      } catch {
        return null;
      }
    })
    .filter((item): item is { href: string; text: string } => Boolean(item))
    .filter((item) => isValidDevpostHackathonUrl(item.href))
    .map((item) => ({ ...item, href: canonicalizeUrl(item.href) }));

  return uniqueBy(links, (item) => item.href);
};

const gatherListingLinks = async (page: Awaited<ReturnType<typeof createPage>>) => {
  const listings = await collectAnchors(page);
  const htmlLinks = extractLinksAndTextFromHtml(await page.content(), page.url());

  return uniqueBy(
    [
      ...listings
        .filter(({ href }) => isValidDevpostHackathonUrl(href))
        .map((item) => ({ ...item, href: canonicalizeUrl(item.href) })),
      ...htmlLinks,
    ],
    (item) => item.href,
  );
};

const extractDateRange = (listingText: string) => {
  const listingRange = parseDevpostDateRange(listingText);
  if (listingRange) {
    return listingRange;
  }

  return parseDateRangeFromText(listingText);
};

const extractDevpostTitle = (listingText: string) => {
  const cutoffWords = [' days left', ' about ', ' Online ', ' participants', ' prizes'];
  for (const marker of cutoffWords) {
    const idx = listingText.indexOf(marker);
    if (idx > 8) {
      return listingText.slice(0, idx).trim();
    }
  }

  return listingText.slice(0, 180).trim();
};

const fallbackTitleFromUrl = (href: string) => {
  try {
    const host = new URL(href).hostname;
    const subdomain = host.split('.')[0] || host;
    return subdomain.replace(/[-_]+/g, ' ').trim();
  } catch {
    return href;
  }
};

const collectPaginatedDevpostLinks = async () => {
  const all: Array<{ href: string; text: string; listUrl: string }> = [];
  const seen = new Set<string>();
  let stalePages = 0;

  for (let pageNumber = 1; ; pageNumber += 1) {
    const listUrl = pageNumber === 1 ? DEVPOST_BASE_URL : `${DEVPOST_BASE_URL}?page=${pageNumber}`;

    let html = '';
    try {
      const response = await fetch(listUrl, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
      });
      html = await response.text();
    } catch {
      stalePages += 1;
      if (stalePages >= DEVPOST_STALE_PAGE_THRESHOLD) {
        break;
      }
      continue;
    }

    const pageLinks = extractLinksAndTextFromHtml(html, listUrl);
    let pageNewCount = 0;
    for (const link of pageLinks) {
      if (seen.has(link.href)) {
        continue;
      }
      seen.add(link.href);
      pageNewCount += 1;
      all.push({ ...link, listUrl });
    }

    if (pageNewCount === 0) {
      stalePages += 1;
    } else {
      stalePages = 0;
    }

    if (stalePages >= DEVPOST_STALE_PAGE_THRESHOLD) {
      break;
    }
  }

  return all;
};

export async function scrapeDevpost(): Promise<ScrapedEventRecord[]> {
  const paginatedListings = await collectPaginatedDevpostLinks();

  const browser = await createBrowser();
  const allListings: Array<{ href: string; text: string; listUrl: string }> = [];

  try {
    for (const listUrl of [DEVPOST_BASE_URL]) {
      const page = await createPage(browser);
      try {
        await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });

        let previousCount = 0;
        let stableIterations = 0;
        for (;;) {
          const listingsBeforeScroll = await gatherListingLinks(page);
          const currentCount = listingsBeforeScroll.length;
          if (currentCount <= previousCount) {
            stableIterations += 1;
          } else {
            stableIterations = 0;
          }
          previousCount = currentCount;

          if (stableIterations >= 1000) {
            allListings.push(...listingsBeforeScroll.map((listing) => ({ ...listing, listUrl })));
            break;
          }

          await page.mouse.wheel(0, 24000);
          await page.waitForTimeout(400);
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  const dedupedListings = uniqueBy(
    [...paginatedListings, ...allListings],
    (listing) => listing.href,
  );

  const results = dedupedListings.map((listing) => {
    const dateRange = extractDateRange(listing.text);
    const fallbackTime = new Date().toISOString();

    return {
      sourcePlatformId: 'devpost',
      sourceUrl: listing.href,
      rawPayload: {
        platform: 'devpost',
        title: listing.text
          ? extractDevpostTitle(listing.text)
          : fallbackTitleFromUrl(listing.href),
        description: listing.text || listing.href,
        listingUrl: listing.listUrl,
        listingText: listing.text || null,
        detailText: null,
        startTime: dateRange?.startTime ? dateRange.startTime.toISOString() : fallbackTime,
        endTime: dateRange?.endTime ? dateRange.endTime.toISOString() : fallbackTime,
        canonicalUrl: listing.href,
        tags: [],
      },
    };
  });
  return results;
}
