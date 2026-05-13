import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  index,
} from 'drizzle-orm/pg-core';

export const rawScrapedEvents = pgTable(
  'raw_scraped_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourcePlatformId: varchar('source_platform_id').notNull(),
    sourceUrl: varchar('source_url').notNull(),
    rawPayload: jsonb('raw_payload').notNull(),
    scrapedAt: timestamp('scraped_at').notNull().defaultNow(),
    normalized: boolean('normalized').notNull().default(false),
    normalizationError: text('normalization_error'),
  },
  (table) => ({
    unprocessedIdx: index('idx_raw_unprocessed').on(table.normalized),
    platformIdx: index('idx_raw_platform').on(table.sourcePlatformId),
  }),
);

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title').notNull(),
    description: text('description'),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }),
    timezone: varchar('timezone').notNull().default('UTC'),
    canonicalUrl: varchar('canonical_url').notNull(),
    dedupeHash: varchar('dedupe_hash').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    timeIdx: index('idx_events_start_time').on(table.startTime),
    hashIdx: index('idx_events_dedupe_hash').on(table.dedupeHash),
  }),
);

export const platforms = pgTable('platforms', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  websiteUrl: varchar('website_url').notNull(),
});

export const eventSources = pgTable(
  'event_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id')
      .references(() => events.id)
      .notNull(),
    platformId: varchar('platform_id')
      .references(() => platforms.id)
      .notNull(),
    url: varchar('url').notNull(),
    externalId: varchar('external_id'),
    lastSyncedAt: timestamp('last_synced_at').notNull().defaultNow(),
  },
  (table) => ({
    eventIdx: index('idx_event_sources_event_id').on(table.eventId),
    platformExtIdx: index('idx_event_sources_platform_ext').on(table.platformId, table.externalId),
  }),
);

export const categories = pgTable('categories', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
});

export const tags = pgTable('tags', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
});

export const eventTags = pgTable(
  'event_tags',
  {
    eventId: uuid('event_id')
      .references(() => events.id)
      .notNull(),
    tagId: varchar('tag_id')
      .references(() => tags.id)
      .notNull(),
  },
  (table) => ({
    eventTagPk: index('idx_event_tags_pk').on(table.eventId, table.tagId), // using index instead of composite pk for simple drizzle queries
  }),
);

export const searchDocuments = pgTable(
  'event_search_documents',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => events.id),
    title: varchar('title').notNull(),
    descriptionText: text('description_text'),
    organizerText: text('organizer_text'),
    tagsJson: jsonb('tags_json'),
    platformsJson: jsonb('platforms_json'),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    documentTsVector: text('document_tsvector'), // Used for postgres FTS if avoiding raw raw tsvector
  },
  (table) => ({
    ftsIdx: index('idx_search_documents_fts').on(table.documentTsVector),
    titleIdx: index('idx_search_documents_title').on(table.title),
    startIdx: index('idx_search_documents_start_time').on(table.startTime),
  }),
);
