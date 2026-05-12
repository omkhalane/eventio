const splitEnvList = (value: string | undefined) =>
  (value || '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const API_KEYS = {
  public: new Set(splitEnvList(process.env.PUBLIC_API_KEYS)),
  internal: new Set(splitEnvList(process.env.INTERNAL_API_KEYS)),
} as const;

export const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
export const PUBLIC_RATE_LIMIT = Number(process.env.PUBLIC_RATE_LIMIT_PER_MINUTE || 120);
export const ANONYMOUS_RATE_LIMIT = Number(process.env.ANONYMOUS_RATE_LIMIT_PER_MINUTE || 30);

export const SUPPORTED_PLATFORMS = [
  'atcoder',
  'codechef',
  'codeforces',
  'devpost',
  'geeksforgeeks',
  'hackerrank',
  'leetcode',
  'mlh',
  'unstop',
] as const;

export const SUPPORTED_STATUS = ['upcoming', 'ongoing', 'past', 'unknown'] as const;

export const SUPPORTED_SORT_FIELDS = ['start_date', 'created_at', 'updated_at', 'title'] as const;

export const SUPPORTED_SORT_ORDERS = ['asc', 'desc'] as const;

export const SUPPORTED_CATEGORIES = [
  'competitive_programming',
  'global_competition',
  'hackathon',
  'hiring_challenge',
  'data_science',
  'community_event',
  'conference',
  'cybersecurity_ctf',
  'open_source',
  'live_stream',
] as const;

export const VALID_QUERY_PARAMS = new Set([
  'platform',
  'platforms',
  'status',
  'page',
  'limit',
  'sort',
  'order',
  'q',
  'search',
  'tags',
  'categories',
  'startDate',
  'endDate',
  'isFree',
  'eventType',
  'price',
  'fees',
]);

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
