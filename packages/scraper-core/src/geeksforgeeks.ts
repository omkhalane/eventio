import type { ScrapedEventRecord } from './types.js';
import { createBrowser, createPage } from './browser.js';
import { cleanText, uniqueBy } from './utils.js';
import { writeScraperOutput } from './output.js';

const GFG_URL = 'https://www.geeksforgeeks.org/events';

const MONTH_LOOKUP: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const parseGfgDate = (value: string) => {
  const match = value.match(
    /([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})\s+([AP]M)\s+IST/i,
  );
  if (!match) {
    return null;
  }

  const month =
    MONTH_LOOKUP[match[1].slice(0, 3).toLowerCase()] ?? MONTH_LOOKUP[match[1].toLowerCase()];
  if (month === undefined) {
    return null;
  }

  let hour = Number(match[4]) % 12;
  if (match[6].toUpperCase() === 'PM') {
    hour += 12;
  }

  const utc = Date.UTC(Number(match[3]), month, Number(match[2]), hour, Number(match[5]));
  return new Date(utc - 5.5 * 60 * 60 * 1000);
};

const stripTags = (value: string) =>
  value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractMetaContent = (html: string, property: string) => {
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["'][^>]*>`,
    'i',
  );
  return html.match(regex)?.[1] || null;
};

const extractTitleTag = (html: string) => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripTags(match[1]) : null;
};

const extractLinksAndTextFromHtml = (html: string, pageUrl: string) => {
  const links = Array.from(
    html.matchAll(/<a[^>]+href=["']([^"']*\/event\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi),
  )
    .map((match) => ({ href: match[1], text: stripTags(match[2]) }))
    .map(({ href, text }) => {
      try {
        return { href: new URL(href, pageUrl).href, text };
      } catch {
        return null;
      }
    })
    .filter((item): item is { href: string; text: string } => Boolean(item));

  return uniqueBy(links, (item) => item.href);
};

const fetchGfgApiListings = async () => {
  const results: Array<{ href: string; text: string; listUrl: string; apiItem: any }> = [];
  const seen = new Set<string>();

  for (let pageNumber = 1; ; pageNumber += 1) {
    const url = `https://practiceapi.geeksforgeeks.org/api/vr/events/?page_number=${pageNumber}&sub_type=all&type=all_events`;
    let json: any;
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'Mozilla/5.0' },
      });
      if (!res.ok) break;
      json = await res.json();
    } catch {
      break;
    }

    // Try common shapes: direct array at `results`, nested `results.results`,
    // or object-of-arrays (e.g., results.upcoming, results.past)
    let items: any[] = [];
    if (Array.isArray(json?.results)) {
      items = json.results;
    } else if (Array.isArray(json?.results?.results)) {
      items = json.results.results;
    } else if (json?.results && typeof json.results === 'object') {
      const nested = Object.values(json.results).flatMap((v) => (Array.isArray(v) ? v : []));
      items = nested;
    } else {
      // fallback: find first array field at top-level
      const arrEntry = Object.values(json).find((v) => Array.isArray(v));
      if (Array.isArray(arrEntry)) items = arrEntry as any[];
    }

    if (!items || items.length === 0) {
      break;
    }

    for (const item of items) {
      // Try to find an event URL/title in common keys
      const href =
        item.event_url ||
        item.url ||
        (item.slug ? `https://www.geeksforgeeks.org/event/${item.slug}` : null) ||
        (item.link ? item.link : null);
      const title = item.title || item.name || item.event_name || '';

      if (!href) continue;
      const canonical = (() => {
        try {
          return new URL(href, 'https://www.geeksforgeeks.org').href;
        } catch {
          return null;
        }
      })();

      if (!canonical) continue;
      if (seen.has(canonical)) continue;
      seen.add(canonical);

      results.push({
        href: canonical,
        text: title || '',
        listUrl: url,
        apiItem: item,
      });
    }
  }

  return results;
};

const collectEventCards = async () => {
  const browser = await createBrowser();
  const page = await createPage(browser);

  try {
    await page.goto(GFG_URL, { waitUntil: 'domcontentloaded', timeout: 120_000 });

    while (true) {
      const button = page.getByText(/Load More Events/i).first();
      if ((await button.count()) === 0) {
        break;
      }

      try {
        await button.click({ timeout: 5_000 });
        await page.waitForTimeout(1_000);
      } catch {
        break;
      }
    }

    const anchors = page.locator('a[href*="/event/"]');
    const anchorCount = await anchors.count();
    const cards: Array<{ href: string; text: string }> = [];

    for (let index = 0; index < anchorCount; index += 1) {
      const anchor = anchors.nth(index);
      const href = await anchor.getAttribute('href');
      if (!href) {
        continue;
      }

      cards.push({
        href: new URL(href, page.url()).href,
        text: (await anchor.innerText()).replace(/\s+/g, ' ').trim(),
      });
    }

    if (cards.length > 0) {
      return uniqueBy(
        cards.filter((card) => /\/event\//.test(card.href)),
        (card) => card.href,
      );
    }

    const html = await page.content();
    const fallbackCards = extractLinksAndTextFromHtml(html, page.url());

    return fallbackCards;
  } finally {
    await page.close();
    await browser.close();
  }
};

const collectEventCardsFromHttp = async () => {
  try {
    const response = await fetch(GFG_URL, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
    });
    const html = await response.text();
    return extractLinksAndTextFromHtml(html, GFG_URL);
  } catch {
    return [];
  }
};

const fetchEventDetail = async (eventUrl: string, listingText: string) => {
  try {
    const response = await fetch(eventUrl, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
    });
    const html = await response.text();
    const title = cleanText(
      extractMetaContent(html, 'og:title') || extractTitleTag(html) || listingText || eventUrl,
    );
    const description = cleanText(
      extractMetaContent(html, 'og:description') || stripTags(html).slice(0, 4000),
    );

    return {
      sourcePlatformId: 'geeksforgeeks',
      sourceUrl: eventUrl,
      rawPayload: {
        platform: 'geeksforgeeks',
        title,
        description,
        listingText,
        startTime: parseGfgDate(listingText)?.toISOString() || null,
        endTime: null,
        canonicalUrl: eventUrl,
      },
    };
  } catch {
    return {
      sourcePlatformId: 'geeksforgeeks',
      sourceUrl: eventUrl,
      rawPayload: {
        platform: 'geeksforgeeks',
        title: cleanText(listingText || eventUrl),
        description: cleanText(listingText || eventUrl),
        listingText,
        startTime: parseGfgDate(listingText)?.toISOString() || null,
        endTime: null,
        canonicalUrl: eventUrl,
      },
    };
  }
};

export async function scrapeGeeksforgeeks(): Promise<ScrapedEventRecord[]> {
  // Prefer API-backed paginated listings when available
  const apiCards = await fetchGfgApiListings();
  if (apiCards.length > 0) {
    const results = apiCards.map((card) => {
      const apiItem = card.apiItem || {};
      const startTime =
        apiItem.start_time ||
        apiItem.startTime ||
        apiItem.date_time ||
        apiItem.date ||
        apiItem.datetime ||
        null;
      const endTime = apiItem.end_time || apiItem.endTime || null;
      const fallbackTime = new Date().toISOString();

      return {
        sourcePlatformId: 'geeksforgeeks',
        sourceUrl: card.href,
        rawPayload: {
          platform: 'geeksforgeeks',
          title: apiItem.title || apiItem.name || card.text || card.href,
          description:
            apiItem.overview || apiItem.description || apiItem.summary || card.text || card.href,
          listingText: card.text || null,
          startTime:
            (startTime && new Date(startTime).toISOString()) ||
            parseGfgDate(card.text)?.toISOString() ||
            fallbackTime,
          endTime:
            (endTime && new Date(endTime).toISOString()) ||
            parseGfgDate(card.text)?.toISOString() ||
            (startTime && new Date(startTime).toISOString()) ||
            fallbackTime,
          canonicalUrl: card.href,
          sourceEvent: apiItem,
        },
      };
    });
    return results;
  }

  const browserCards = await collectEventCards();
  const httpCards = await collectEventCardsFromHttp();
  const cards = uniqueBy([...browserCards, ...httpCards], (card) => card.href);
  const results = await Promise.all(cards.map((card) => fetchEventDetail(card.href, card.text)));
  return results;
}
