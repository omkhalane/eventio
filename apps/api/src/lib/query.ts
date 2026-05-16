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
} from './config.js';

const { and, asc, db, desc, events, sql } = database;

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

const buildArrayOverlapCondition = (column: any, values: string[]) => {
  if (values.length === 0) return null;
  return sql`${column} && array[${sql.raw(values.map((v) => `'${v}'`).join(','))}]::text[]`;
};

const buildTextSearchCondition = (term: string) => {
  const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
  return sql`(
    COALESCE(${events.title}, '') ILIKE ${pattern}
    OR COALESCE(${events.description}, '') ILIKE ${pattern}
    OR COALESCE(${events.shortDescription}, '') ILIKE ${pattern}
    OR COALESCE(${events.organizerName}, '') ILIKE ${pattern}
  )`;
};

const buildTextExclusionCondition = (term: string) => {
  const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
  return sql`NOT (
    COALESCE(${events.title}, '') ILIKE ${pattern}
    OR COALESCE(${events.description}, '') ILIKE ${pattern}
    OR COALESCE(${events.shortDescription}, '') ILIKE ${pattern}
    OR COALESCE(${events.organizerName}, '') ILIKE ${pattern}
  )`;
};

const statusCondition = (status: StatusFilter, now: string) => {
  switch (status) {
    case 'upcoming':
      return sql`${events.startDate} > ${now}`;
    case 'ongoing':
      return sql`${events.startDate} <= ${now} AND ${events.endDate} IS NOT NULL AND ${events.endDate} >= ${now}`;
    case 'past':
      return sql`${events.endDate} IS NOT NULL AND ${events.endDate} < ${now}`;
    case 'unknown':
      return sql`${events.startDate} IS NULL`;
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
    conditions.push(sql`${events.platform} IN (${sql.raw(query.platforms.map((v) => `'${v}'`).join(','))})`);
  }
  if (query.categories.length > 0) {
    conditions.push(sql`${events.category} IN (${sql.raw(query.categories.map((v) => `'${v}'`).join(','))})`);
  }
  if (query.tags.length > 0) {
    conditions.push(buildArrayOverlapCondition(events.tags, query.tags));
  }
  if (query.status) {
    conditions.push(statusCondition(query.status, now));
  }
  if (query.startDate) {
    conditions.push(sql`${events.startDate} >= ${query.startDate.toISOString()}`);
  }
  if (query.endDate) {
    conditions.push(sql`${events.startDate} <= ${query.endDate.toISOString()}`);
  }
  if (query.search) {
    conditions.push(buildTextSearchCondition(query.search));
  }
  if (query.eventTypes.length > 0) {
    conditions.push(buildArrayOverlapCondition(events.tags, query.eventTypes));
  }
  if (query.fees.length > 0) {
    for (const fee of query.fees) {
      conditions.push(buildTextExclusionCondition(fee));
    }
  }
  if (query.isFree === false) {
    conditions.push(sql`${events.isFree} = false`);
  }
  if (query.price !== undefined && query.price > 0) {
    conditions.push(sql`${events.isFree} = false`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions.filter(Boolean)) : undefined;
  const totalResult = await db
    .select({ total: sql`count(*)` as any })
    .from(events)
    .where(whereClause);

  const total = Number(totalResult[0]?.total || 0);
  const pageCount = Math.max(1, Math.ceil(total / query.limit));
  const offset = (query.page - 1) * query.limit;

  const sortColumnMap = {
    start_date: events.startDate,
    created_at: events.scrapedAt,
    updated_at: events.updatedAt,
    title: events.title,
  } as const;

    const rows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      shortDescription: events.shortDescription,
      startDate: events.startDate,
      endDate: events.endDate,
      timezone: events.timezone,
      canonicalUrl: events.sourceUrl,
      sourceUrl: events.sourceUrl,
      slug: events.slug,
      scrapedAt: events.scrapedAt,
      updatedAt: events.updatedAt,
      platform: events.platform,
      platformEventId: events.platformEventId,
      tags: events.tags,
      skills: events.skills,
      mode: events.mode,
      organizerName: events.organizerName,
      organizerLogo: events.organizerLogo,
      organizerUrl: events.organizerUrl,
      category: events.category,
      subcategory: events.subcategory,
      bannerImage: events.bannerImage,
      thumbnailImage: events.thumbnailImage,
      isFree: events.isFree,
      price: events.price,
      location: events.location,
      city: events.city,
      country: events.country,
      eligibility: events.eligibility,
      prizes: events.prizes,
      maxTeamSize: events.maxTeamSize,
      minTeamSize: events.minTeamSize,
      views: events.views,
      clicks: events.clicks,
      bookmarks: events.bookmarks,
      rawData: events.rawData,
    })
    .from(events)
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
  const tags = Array.isArray(row.tags) ? row.tags : [];
  const platform = row.platform || 'unknown';
  const now = new Date();
  const startTime = row.startDate;
  const endTime = row.endDate;
  const status =
    startTime > now
      ? 'upcoming'
      : endTime && startTime <= now && endTime >= now
        ? 'ongoing'
        : endTime && endTime < now
          ? 'past'
          : 'unknown';

  return {
    id: row.id,
    external_id: row.id,
    title: row.title,
    description: row.description,
    shortDescription: row.shortDescription,
    startDate: startTime ? startTime.toISOString() : null,
    endDate: endTime ? endTime.toISOString() : null,
    start_time: startTime ? startTime.toISOString() : null,
    end_time: endTime ? endTime.toISOString() : null,
    timezone: row.timezone,
    url: row.sourceUrl,
    canonicalUrl: row.sourceUrl,
    platform,
    platform_event_id: row.platformEventId,
    category: row.category,
    subcategory: row.subcategory,
    event_type: tags[0] || 'event',
    tags,
    skills: row.skills || [],
    mode: row.mode,
    is_online: row.mode === 'online' || tags.includes('online'),
    is_free: row.isFree ?? true,
    price: row.price,
    location: row.location,
    city: row.city,
    country: row.country,
    status,
    bannerImage: row.bannerImage,
    thumbnailImage: row.thumbnailImage,
    organizerName: row.organizerName,
    organizerLogo: row.organizerLogo,
    organizerUrl: row.organizerUrl,
    eligibility: row.eligibility,
    prizes: row.prizes,
    maxTeamSize: row.maxTeamSize,
    minTeamSize: row.minTeamSize,
    views: row.views || 0,
    clicks: row.clicks || 0,
    bookmarks: row.bookmarks || 0,
    slug: row.slug,
    extra: {
      ...((row.rawData as object) || {}),
      platforms: [platform],
      tags,
      organizer: row.organizerName,
    },
    created_at: row.scrapedAt ? row.scrapedAt.toISOString() : null,
    updated_at: row.updatedAt ? row.updatedAt.toISOString() : null,
    createdAt: row.scrapedAt ? row.scrapedAt.toISOString() : null,
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
};

export const getEventBySlug = async (slug: string) => {
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      shortDescription: events.shortDescription,
      startDate: events.startDate,
      endDate: events.endDate,
      timezone: events.timezone,
      canonicalUrl: events.sourceUrl,
      sourceUrl: events.sourceUrl,
      slug: events.slug,
      scrapedAt: events.scrapedAt,
      updatedAt: events.updatedAt,
      platform: events.platform,
      platformEventId: events.platformEventId,
      tags: events.tags,
      skills: events.skills,
      mode: events.mode,
      organizerName: events.organizerName,
      organizerLogo: events.organizerLogo,
      organizerUrl: events.organizerUrl,
      category: events.category,
      subcategory: events.subcategory,
      bannerImage: events.bannerImage,
      thumbnailImage: events.thumbnailImage,
      isFree: events.isFree,
      price: events.price,
      location: events.location,
      city: events.city,
      country: events.country,
      eligibility: events.eligibility,
      prizes: events.prizes,
      maxTeamSize: events.maxTeamSize,
      minTeamSize: events.minTeamSize,
      views: events.views,
      clicks: events.clicks,
      bookmarks: events.bookmarks,
      rawData: events.rawData,
    })
    .from(events)
    .where(database.eq(events.slug, slug))
    .limit(1);

  return rows[0] || null;
};

export const buildStats = async () => {
  const now = new Date().toISOString();
  const upcoming = sql<number>`count(*) filter (where ${events.startDate} > ${now})`;
  const ongoing = sql<number>`count(*) filter (where ${events.startDate} <= ${now} and ${events.endDate} is not null and ${events.endDate} >= ${now})`;
  const past = sql<number>`count(*) filter (where ${events.endDate} is not null and ${events.endDate} < ${now})`;
  const unknown = sql<number>`count(*) filter (where ${events.startDate} is null)`;

  const totals = await db
    .select({
      total: sql`count(*)` as any,
      upcoming: upcoming as any,
      ongoing: ongoing as any,
      past: past as any,
      unknown: unknown as any,
    })
    .from(events);

  const platformExpression = events.platform;
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
