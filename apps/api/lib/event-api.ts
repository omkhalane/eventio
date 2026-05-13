import {
  buildEventResponse,
  buildEventsQuery,
  buildStats,
  parseEventsQuery,
} from '../src/lib/query';

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
): Promise<ApiResponse> {
  const normalizedPath = normalizePath(path);
  const upperMethod = method.toUpperCase();

  if (upperMethod !== 'GET') {
    return {
      status: 405,
      headers: { Allow: 'GET' },
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

  return { status: 404, body: { success: false, error: 'Not Found' } };
}
