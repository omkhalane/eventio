import * as database from '@eventio/db';

import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  SUPPORTED_CATEGORIES,
  SUPPORTED_PLATFORMS,
  SUPPORTED_SORT_FIELDS,
  SUPPORTED_SORT_ORDERS,
  SUPPORTED_STATUS,
  VALID_QUERY_PARAMS,
} from './config';

const { and, asc, db, desc, eq, events, searchDocuments, sql } = database;

export type StatusFilter = (typeof SUPPORTED_STATUS)[number];
export type SortField = (typeof SUPPORTED_SORT_FIELDS)[number];
export type SortOrder = (typeof SUPPORTED_SORT_ORDERS)[number];

export interface ParsedEventsQuery {
  platforms: string[];
  status?: StatusFilter;
  page: number;
  limit: number;
  sort: SortField;
  order: SortOrder;
  search?: string;
  tags: string[];
  categories: string[];
  startDate?: Date;
  endDate?: Date;
  isFree?: boolean;
  eventTypes: string[];
  price?: number;
  fees: string[];
}

export interface ValidationFailure {
  message: string;
  extra?: Record<string, unknown>;
}

const normalizeList = (value: string | string[] | undefined) => {
  if (!value) return [] as string[];
  const items = Array.isArray(value) ? value : value.split(',');
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
};

const parseBoolean = (value: string | string[] | undefined) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
};

const parsePositiveInteger = (
  value: string | string[] | undefined,
  fallback: number,
  max?: number,
) => {
  if (value === undefined) return fallback;
  if (Array.isArray(value) || value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  if (max !== undefined && parsed > max) return null;
  return parsed;
};

const parseNonNegativeNumber = (value: string | string[] | undefined) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value) || value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
};

const parseDate = (value: string | string[] | undefined) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value) || value.trim() === '') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const validateSupportedValues = (values: string[], allowed: readonly string[]) =>
  values.filter((value) => !allowed.includes(value));

const escapeSqlLiteral = (value: string) => `'${value.replace(/'/g, "''")}'`;

const buildListMatchCondition = (column: any, values: string[]) => {
  if (values.length === 0) return null;
  // Use the PostgreSQL ?| operator which checks if any of the elements in the text array exist as keys in the JSONB
  return sql`${column} ?| array[${sql.raw(values.map((v) => `'${v}'`).join(','))}]`;
};

const buildTextSearchCondition = (term: string) => {
  const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
  return sql`(
    COALESCE(${events.title}, '') ILIKE ${pattern}
    OR COALESCE(${events.description}, '') ILIKE ${pattern}
    OR COALESCE(${searchDocuments.descriptionText}, '') ILIKE ${pattern}
    OR COALESCE(${searchDocuments.organizerText}, '') ILIKE ${pattern}
    OR COALESCE(${searchDocuments.tagsJson}::text, '') ILIKE ${pattern}
  )`;
};

const buildTextExclusionCondition = (term: string) => {
  const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
  return sql`NOT (
    COALESCE(${events.title}, '') ILIKE ${pattern}
    OR COALESCE(${events.description}, '') ILIKE ${pattern}
    OR COALESCE(${searchDocuments.descriptionText}, '') ILIKE ${pattern}
    OR COALESCE(${searchDocuments.organizerText}, '') ILIKE ${pattern}
    OR COALESCE(${searchDocuments.tagsJson}::text, '') ILIKE ${pattern}
  )`;
};

const statusCondition = (status: StatusFilter, now: string) => {
  switch (status) {
    case 'upcoming':
      return sql`${events.startTime} > ${now}`;
    case 'ongoing':
      return sql`${events.startTime} <= ${now} AND ${events.endTime} IS NOT NULL AND ${events.endTime} >= ${now}`;
    case 'past':
      return sql`${events.endTime} IS NOT NULL AND ${events.endTime} < ${now}`;
    case 'unknown':
      return sql`${events.startTime} IS NULL`;
  }
};

export const parseEventsQuery = (query: Record<string, string | string[] | undefined>) => {
  const invalidParams = Object.keys(query).filter((param) => !VALID_QUERY_PARAMS.has(param));
  if (invalidParams.length > 0) {
    return {
      message: 'Invalid query parameter',
      extra: { allowed: Array.from(VALID_QUERY_PARAMS), invalid: invalidParams },
    } satisfies ValidationFailure;
  }

  const platforms = normalizeList(query.platform ?? query.platforms);
  const invalidPlatforms = validateSupportedValues(platforms, SUPPORTED_PLATFORMS);
  if (invalidPlatforms.length > 0) {
    return {
      message: 'Invalid platform parameter',
      extra: { allowed: [...SUPPORTED_PLATFORMS], invalid: invalidPlatforms },
    } satisfies ValidationFailure;
  }

  const categories = normalizeList(query.categories);
  const invalidCategories = validateSupportedValues(categories, SUPPORTED_CATEGORIES);
  if (invalidCategories.length > 0) {
    return {
      message: 'Invalid categories parameter',
      extra: { allowed: [...SUPPORTED_CATEGORIES], invalid: invalidCategories },
    } satisfies ValidationFailure;
  }

  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  if (page === null) return { message: 'Invalid page parameter' } satisfies ValidationFailure;

  const limit = parsePositiveInteger(query.limit, DEFAULT_LIMIT, MAX_LIMIT);
  if (limit === null) {
    return {
      message: 'Invalid limit parameter',
      extra: { maximum: MAX_LIMIT },
    } satisfies ValidationFailure;
  }

  const sort = (query.sort ? String(query.sort) : 'start_date') as SortField;
  if (!SUPPORTED_SORT_FIELDS.includes(sort)) {
    return {
      message: 'Invalid sort parameter',
      extra: { allowed: [...SUPPORTED_SORT_FIELDS] },
    } satisfies ValidationFailure;
  }

  const order = (query.order ? String(query.order) : 'asc') as SortOrder;
  if (!SUPPORTED_SORT_ORDERS.includes(order)) {
    return {
      message: 'Invalid order parameter',
      extra: { allowed: [...SUPPORTED_SORT_ORDERS] },
    } satisfies ValidationFailure;
  }

  const statusValue = query.status;
  let status: StatusFilter | undefined;
  if (statusValue !== undefined) {
    if (Array.isArray(statusValue) || !SUPPORTED_STATUS.includes(statusValue as StatusFilter)) {
      return {
        message: 'Invalid status parameter',
        extra: { allowed: [...SUPPORTED_STATUS] },
      } satisfies ValidationFailure;
    }
    status = statusValue as StatusFilter;
  }

  const searchTerm = ((query.q ?? query.search) || '').toString().trim();
  if (searchTerm === '' && (query.q !== undefined || query.search !== undefined)) {
    return { message: 'Invalid search parameter' } satisfies ValidationFailure;
  }

  const startDate = parseDate(query.startDate);
  if (startDate === null)
    return { message: 'Invalid startDate parameter' } satisfies ValidationFailure;

  const endDate = parseDate(query.endDate);
  if (endDate === null) return { message: 'Invalid endDate parameter' } satisfies ValidationFailure;

  if (startDate && endDate && startDate > endDate) {
    return {
      message: 'Invalid date range',
      extra: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
    } satisfies ValidationFailure;
  }

  const isFree = parseBoolean(query.isFree);
  if (isFree === null) return { message: 'Invalid isFree parameter' } satisfies ValidationFailure;

  const price = parseNonNegativeNumber(query.price);
  if (price === null) return { message: 'Invalid price parameter' } satisfies ValidationFailure;

  return {
    platforms,
    status,
    page,
    limit,
    sort,
    order,
    search: searchTerm || undefined,
    tags: normalizeList(query.tags),
    categories,
    startDate,
    endDate,
    isFree,
    eventTypes: normalizeList(query.eventType),
    price,
    fees: normalizeList(query.fees),
  } satisfies ParsedEventsQuery;
};

export const buildEventsQuery = async (query: ParsedEventsQuery) => {
  const now = new Date().toISOString();
  const conditions: any[] = [];

  if (query.platforms.length > 0) {
    conditions.push(buildListMatchCondition(searchDocuments.platformsJson, query.platforms));
  }
  if (query.categories.length > 0) {
    conditions.push(buildListMatchCondition(searchDocuments.tagsJson, query.categories));
  }
  if (query.tags.length > 0) {
    conditions.push(buildListMatchCondition(searchDocuments.tagsJson, query.tags));
  }
  if (query.status) {
    conditions.push(statusCondition(query.status, now));
  }
  if (query.startDate) {
    conditions.push(sql`${events.startTime} >= ${query.startDate.toISOString()}`);
  }
  if (query.endDate) {
    conditions.push(sql`${events.startTime} <= ${query.endDate.toISOString()}`);
  }
  if (query.search) {
    conditions.push(buildTextSearchCondition(query.search));
  }
  if (query.eventTypes.length > 0) {
    conditions.push(buildListMatchCondition(searchDocuments.tagsJson, query.eventTypes));
  }
  if (query.fees.length > 0) {
    for (const fee of query.fees) {
      conditions.push(buildTextExclusionCondition(fee));
    }
  }
  if (query.isFree === false) {
    conditions.push(sql`1 = 0`);
  }
  if (query.price !== undefined && query.price > 0) {
    conditions.push(sql`1 = 0`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions.filter(Boolean)) : undefined;
  const totalResult = await db
    .select({ total: sql`count(*)` as any })
    .from(events)
    .leftJoin(searchDocuments, eq(events.id, searchDocuments.id))
    .where(whereClause);

  const total = Number(totalResult[0]?.total || 0);
  const pageCount = Math.max(1, Math.ceil(total / query.limit));
  const offset = (query.page - 1) * query.limit;

  const sortColumnMap = {
    start_date: events.startTime,
    created_at: events.createdAt,
    updated_at: events.updatedAt,
    title: events.title,
  } as const;

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      startTime: events.startTime,
      endTime: events.endTime,
      timezone: events.timezone,
      canonicalUrl: events.canonicalUrl,
      dedupeHash: events.dedupeHash,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
      platformsJson: searchDocuments.platformsJson,
      tagsJson: searchDocuments.tagsJson,
      organizerText: searchDocuments.organizerText,
    })
    .from(events)
    .leftJoin(searchDocuments, eq(events.id, searchDocuments.id))
    .where(whereClause)
    .orderBy(
      query.order === 'desc' ? desc(sortColumnMap[query.sort]) : asc(sortColumnMap[query.sort]),
    )
    .limit(query.limit)
    .offset(offset);

  return {
    rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      hasNext: query.page < pageCount,
    },
  };
};

export const buildEventResponse = (row: any) => {
  const platforms = Array.isArray(row.platformsJson)
    ? row.platformsJson.filter((item: unknown) => typeof item === 'string')
    : [];
  const tags = Array.isArray(row.tagsJson)
    ? row.tagsJson.filter((item: unknown) => typeof item === 'string')
    : [];
  const platform = platforms[0] || 'unknown';
  const now = new Date();
  const status =
    row.startTime > now
      ? 'upcoming'
      : row.endTime && row.startTime <= now && row.endTime >= now
        ? 'ongoing'
        : row.endTime && row.endTime < now
          ? 'past'
          : 'unknown';

  return {
    id: row.id,
    external_id: row.id,
    title: row.title,
    description: row.description,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime ? row.endTime.toISOString() : null,
    start_time: row.startTime.toISOString(),
    end_time: row.endTime ? row.endTime.toISOString() : null,
    timezone: row.timezone,
    url: row.canonicalUrl,
    canonicalUrl: row.canonicalUrl,
    platform,
    event_type: tags[0] || 'event',
    tags,
    is_online: tags.includes('online') || platform !== 'unknown',
    is_free: true,
    status,
    extra: {
      platforms,
      tags,
      organizer: row.organizerText,
    },
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
};

export const buildStats = async () => {
  const now = new Date().toISOString();
  const upcoming = sql<number>`count(*) filter (where ${events.startTime} > ${now})`;
  const ongoing = sql<number>`count(*) filter (where ${events.startTime} <= ${now} and ${events.endTime} is not null and ${events.endTime} >= ${now})`;
  const past = sql<number>`count(*) filter (where ${events.endTime} is not null and ${events.endTime} < ${now})`;
  const unknown = sql<number>`count(*) filter (where ${events.startTime} is null)`;

  const totals = await db
    .select({
      total: sql`count(*)` as any,
      upcoming: upcoming as any,
      ongoing: ongoing as any,
      past: past as any,
      unknown: unknown as any,
    })
    .from(events)
    .leftJoin(searchDocuments, eq(events.id, searchDocuments.id));

  const platformExpression = sql`coalesce(nullif(${searchDocuments.platformsJson} ->> 0, ''), 'unknown')`;
  const platformRows = await db
    .select({
      platform: platformExpression as any,
      total: sql`count(*)` as any,
      upcoming: upcoming as any,
      ongoing: ongoing as any,
      past: past as any,
      unknown: unknown as any,
    })
    .from(events)
    .leftJoin(searchDocuments, eq(events.id, searchDocuments.id))
    .groupBy(platformExpression)
    .orderBy(asc(platformExpression));

  return {
    total_events: Number(totals[0]?.total || 0),
    upcoming: Number(totals[0]?.upcoming || 0),
    ongoing: Number(totals[0]?.ongoing || 0),
    past: Number(totals[0]?.past || 0),
    unknown: Number(totals[0]?.unknown || 0),
    platforms: platformRows.map((row: any) => ({
      platform: row.platform,
      total: Number(row.total || 0),
      upcoming: Number(row.upcoming || 0),
      ongoing: Number(row.ongoing || 0),
      past: Number(row.past || 0),
      unknown: Number(row.unknown || 0),
    })),
  };
};
