import { logger } from '@eventio/observability';
import { scrapingQueue } from '@eventio/queue';

import {
  buildEventResponse,
  buildEventsQuery,
  buildStats,
  getEventBySlug,
  parseEventsQuery,
} from './query.js';
import { getUser, syncUser } from './users.js';

export type ApiQueryValue = string | string[] | undefined;
export type ApiQuery = Record<string, ApiQueryValue>;

export interface ApiResponse {
  status: number;
  headers?: Record<string, string>;
  body: unknown;
}

const normalizePath = (path: string) => path.replace(/^\/api\/v1/, '').replace(/\/$/, '') || '/';

class AnalyticsBuffer {
  private views = new Map<string, number>();
  private clicks = new Map<string, number>();
  private bookmarks = new Map<string, number>();
  private flushInterval: any = null;
  private isFlushing = false;

  constructor() {
    if (typeof clearInterval !== 'undefined' && !process.env.VERCEL) {
      this.flushInterval = setInterval(() => this.flush(), 10000);
    }
  }

  public async track(slug: string, type: 'view' | 'click' | 'bookmark') {
    if (type === 'view') {
      this.views.set(slug, (this.views.get(slug) || 0) + 1);
    } else if (type === 'click') {
      this.clicks.set(slug, (this.clicks.get(slug) || 0) + 1);
    } else if (type === 'bookmark') {
      this.bookmarks.set(slug, (this.bookmarks.get(slug) || 0) + 1);
    }

    if (process.env.VERCEL || (this.views.size + this.clicks.size + this.bookmarks.size) >= 20) {
      this.flush().catch((e) => console.error('Asynchronous flush failed:', e));
    }
  }

  private async flush() {
    if (this.isFlushing) return;
    this.isFlushing = true;

    const viewsToFlush = Array.from(this.views.entries());
    const clicksToFlush = Array.from(this.clicks.entries());
    const bookmarksToFlush = Array.from(this.bookmarks.entries());

    this.views.clear();
    this.clicks.clear();
    this.bookmarks.clear();

    if (viewsToFlush.length === 0 && clicksToFlush.length === 0 && bookmarksToFlush.length === 0) {
      this.isFlushing = false;
      return;
    }

    try {
      const database = await import('@eventio/db');
      const { db, events, sql, eq } = database;

      await db.transaction(async (tx) => {
        for (const [slug, count] of viewsToFlush) {
          await tx
            .update(events)
            .set({ views: sql`${events.views} + ${count}` })
            .where(eq(events.slug, slug));
        }

        for (const [slug, count] of clicksToFlush) {
          await tx
            .update(events)
            .set({ clicks: sql`${events.clicks} + ${count}` })
            .where(eq(events.slug, slug));
        }

        for (const [slug, count] of bookmarksToFlush) {
          await tx
            .update(events)
            .set({ bookmarks: sql`${events.bookmarks} + ${count}` })
            .where(eq(events.slug, slug));
        }
      });
    } catch (err) {
      console.error('Failed to flush analytics buffer:', err);
      for (const [slug, count] of viewsToFlush) {
        this.views.set(slug, (this.views.get(slug) || 0) + count);
      }
      for (const [slug, count] of clicksToFlush) {
        this.clicks.set(slug, (this.clicks.get(slug) || 0) + count);
      }
      for (const [slug, count] of bookmarksToFlush) {
        this.bookmarks.set(slug, (this.bookmarks.get(slug) || 0) + count);
      }
    } finally {
      this.isFlushing = false;
    }
  }
}

const analyticsBuffer = new AnalyticsBuffer();


export async function handleApiRequest(
  method: string,
  path: string,
  query: ApiQuery,
  body?: any,
): Promise<ApiResponse> {
  const normalizedPath = normalizePath(path);
  const upperMethod = method.toUpperCase();

  if (upperMethod !== 'GET' && upperMethod !== 'POST') {
    return {
      status: 405,
      headers: { Allow: 'GET, POST' },
      body: { success: false, error: 'Method Not Allowed' },
    };
  }

  if (normalizedPath === '/healthz') {
    return { status: 200, body: { status: 'ok' } };
  }

  if (normalizedPath === '/stats') {
    const data = await buildStats();
    return { status: 200, body: { data } };
  }

  if (normalizedPath === '/cron/scrape') {
    logger.info({ query }, 'Vercel Cron Triggered');
    
    const allPlatforms = [
      'codeforces', 'leetcode', 'hackerrank', 'unstop', 
      'devpost', 'atcoder', 'codechef', 'geeksforgeeks', 'mlh'
    ];

    const platform = query.platform as string;
    const platformsToScrape = platform ? [platform] : allPlatforms;

    for (const p of platformsToScrape) {
      if (allPlatforms.includes(p)) {
        const { scrapingQueue } = await import('@eventio/queue');
        await scrapingQueue.add(`vercel-cron-${p}`, { platform: p });
      }
    }

    return { status: 200, body: { success: true, message: `Scrapers queued: ${platformsToScrape.join(', ')}` } };
  }

  if (normalizedPath === '/events') {
    const parsed = parseEventsQuery(query);

    if ('message' in parsed) {
      return {
        status: 400,
        body: { success: false, error: parsed.message, ...(parsed.extra || {}) },
      };
    }

    const { rows, pagination } = await buildEventsQuery(parsed);
    const data = rows.map(buildEventResponse);

    return { status: 200, body: { data, pagination } };
  }

  if (normalizedPath.startsWith('/events/')) {
    const parts = normalizedPath.split('/').filter(Boolean);
    if (parts.length === 3 && parts[2] === 'track') {
      const slug = parts[1];
      const trackingBody = body || query || {};
      const type = trackingBody.type as 'view' | 'click' | 'bookmark';
      if (type === 'view' || type === 'click' || type === 'bookmark') {
        await analyticsBuffer.track(slug, type);
        return { status: 200, body: { success: true } };
      }
      return { status: 400, body: { success: false, error: 'Invalid tracking type' } };
    }

    const slug = parts[1];
    const event = await getEventBySlug(slug);

    if (!event) {
      return { status: 404, body: { success: false, error: 'Event not found' } };
    }

    return { status: 200, body: { data: buildEventResponse(event) } };
  }

  // User routes
  if (normalizedPath.startsWith('/users')) {
    const parts = normalizedPath.split('/').filter(Boolean);
    
    // GET /users/:googleId
    if (upperMethod === 'GET' && parts.length === 2) {
      const googleId = parts[1];
      const user = await getUser(googleId);
      if (!user) {
        return { status: 404, body: { success: false, error: 'User not found' } };
      }
      return { status: 200, body: { data: user } };
    }

    // POST /users
    if (upperMethod === 'POST') {
      const userData = (body || query) as {
        googleId?: string;
        email?: string;
        isSubscribed?: string | boolean;
      };

      const googleId = userData.googleId;
      const email = userData.email;
      const isSubscribed = userData.isSubscribed === 'true' || userData.isSubscribed === true;

      if (!googleId || !email) {
        return { status: 400, body: { success: false, error: 'googleId and email are required' } };
      }

      const user = await syncUser({ googleId, email, isSubscribed });
      return { status: 200, body: { data: user } };
    }
  }

  return { status: 404, body: { success: false, error: 'Not Found' } };
}
