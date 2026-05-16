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
    const slug = normalizedPath.replace('/events/', '');
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
