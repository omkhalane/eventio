import { collectAnchors, createBrowser, createPage } from './browser';
import { parseDateRangeFromText, parseRelativeDeadline, uniqueBy } from './utils';
import type { ScrapedEventRecord } from './types';
import { writeScraperOutput } from './output';

export const UNSTOP_URLS = [
  'https://unstop.com/competitions',
  'https://unstop.com/hackathons',
  'https://unstop.com/scholarships',
  'https://unstop.com/workshops-webinars',
  'https://unstop.com/conferences',
];

const UNSTOP_STALE_PAGE_THRESHOLD = 100;

const LISTING_PATH_PREFIXES = [
  '/competitions/',
  '/hackathons/',
  '/quiz/',
  '/workshops-webinars/',
  '/conferences/',
  '/scholarships/',
];

const LISTING_PATH_PATTERN = new RegExp(
  `^(${LISTING_PATH_PREFIXES.map((prefix) => prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})[a-z0-9-]+-\\d+/?$`,
  'i',
);

const stripTags = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const canonicalizeUrl = (href: string) => {
  const url = new URL(href);
  url.hash = '';
  url.search = '';
  return url.href;
};

const isValidUnstopListingUrl = (href: string) => {
  try {
    const url = new URL(href);
    return (
      (url.hostname === 'unstop.com' || url.hostname === 'www.unstop.com') &&
      LISTING_PATH_PATTERN.test(url.pathname)
    );
  } catch {
    return false;
  }
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
    .filter((item) => isValidUnstopListingUrl(item.href))
    .map((item) => ({ ...item, href: canonicalizeUrl(item.href) }));

  return uniqueBy(links, (item) => item.href);
};

const collectPaginatedUnstopLinks = async () => {
  const all: Array<{ href: string; text: string; listUrl: string }> = [];
  const seen = new Set<string>();

  for (const baseUrl of UNSTOP_URLS) {
    let stalePages = 0;

    for (let pageNumber = 1; ; pageNumber += 1) {
      const connector = baseUrl.includes('?') ? '&' : '?';
      const listUrl = pageNumber === 1 ? baseUrl : `${baseUrl}${connector}page=${pageNumber}`;

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
        if (stalePages >= UNSTOP_STALE_PAGE_THRESHOLD) {
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

      if (stalePages >= UNSTOP_STALE_PAGE_THRESHOLD) {
        break;
      }
    }
  }

  return all;
};

const gatherListingLinks = async (page: Awaited<ReturnType<typeof createPage>>) => {
  const links = await collectAnchors(page);
  const htmlLinks = extractLinksAndTextFromHtml(await page.content(), page.url());

  return uniqueBy(
    [
      ...links
        .filter(({ href }) => isValidUnstopListingUrl(href))
        .map((item) => ({ ...item, href: canonicalizeUrl(item.href) })),
      ...htmlLinks,
    ],
    (item) => item.href,
  );
};

const extractDateRange = (listingText: string) => {
  const dateRange = parseDateRangeFromText(listingText);
  if (dateRange) {
    return dateRange;
  }

  const relativeDeadline = parseRelativeDeadline(listingText);
  if (relativeDeadline) {
    return {
      startTime: relativeDeadline.referenceDate,
      endTime: relativeDeadline.deadline,
    };
  }

  return null;
};

const extractUnstopTitle = (listingText: string, listingUrl: string) => {
  if (!listingText || listingText.trim().length < 5) {
    try {
      const pathname = new URL(listingUrl).pathname;
      const slug = pathname.split('/').filter(Boolean).pop() || 'unstop event';
      return slug.replace(/-\d+$/, '').replace(/[-_]+/g, ' ').trim();
    } catch {
      return 'unstop event';
    }
  }

  const markers = [' Posted ', ' days left', ' hours left', ' minutes left', ' months left'];
  for (const marker of markers) {
    const index = listingText.indexOf(marker);
    if (index > 12) {
      return listingText.slice(0, index).trim();
    }
  }

  return listingText.slice(0, 180).trim();
};

export async function scrapeUnstop(): Promise<ScrapedEventRecord[]> {
  const paginatedListings = await collectPaginatedUnstopLinks();

  const browser = await createBrowser();
  const allListings: Array<{ href: string; text: string; listUrl: string }> = [];

  const collectForUrl = async (listUrl: string) => {
    const page = await createPage(browser);
    try {
      await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
      let previousCount = 0;
      let stableIterations = 0;
      let listings: Array<{ href: string; text: string }> = [];

      for (;;) {
        listings = await gatherListingLinks(page);
        if (listings.length <= previousCount) {
          stableIterations += 1;
        } else {
          stableIterations = 0;
        }
        previousCount = listings.length;

        if (stableIterations >= 200) {
          break;
        }

        await page.mouse.wheel(0, 24_000);
        await page.waitForTimeout(400);
      }

      return listings.map((listing) => ({ ...listing, listUrl }));
    } finally {
      await page.close();
    }
  };

  try {
    const chunks: string[][] = [];
    const concurrency = 4;
    for (let index = 0; index < UNSTOP_URLS.length; index += concurrency) {
      chunks.push(UNSTOP_URLS.slice(index, index + concurrency));
    }

    for (const chunk of chunks) {
      const results = await Promise.all(chunk.map((url) => collectForUrl(url)));
      for (const listings of results) {
        allListings.push(...listings);
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
      sourcePlatformId: 'unstop',
      sourceUrl: listing.href,
      rawPayload: {
        platform: 'unstop',
        title: extractUnstopTitle(listing.text, listing.href),
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

  await writeScraperOutput('unstop', results);
  return results;
}
