CREATE TABLE IF NOT EXISTS "categories" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"platform_id" varchar NOT NULL,
	"url" varchar NOT NULL,
	"external_id" varchar,
	"last_synced_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_tags" (
	"event_id" uuid NOT NULL,
	"tag_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"timezone" varchar DEFAULT 'UTC' NOT NULL,
	"canonical_url" varchar NOT NULL,
	"dedupe_hash" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_dedupe_hash_unique" UNIQUE("dedupe_hash")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platforms" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"website_url" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "raw_scraped_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_platform_id" varchar NOT NULL,
	"source_url" varchar NOT NULL,
	"raw_payload" jsonb NOT NULL,
	"scraped_at" timestamp DEFAULT now() NOT NULL,
	"normalized" boolean DEFAULT false NOT NULL,
	"normalization_error" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_search_documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description_text" text,
	"tags_json" jsonb,
	"platforms_json" jsonb,
	"start_time" timestamp with time zone NOT NULL,
	"document_tsvector" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_event_sources_event_id" ON "event_sources" ("event_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_event_sources_platform_ext" ON "event_sources" ("platform_id","external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_event_tags_pk" ON "event_tags" ("event_id","tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_start_time" ON "events" ("start_time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_dedupe_hash" ON "events" ("dedupe_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_raw_unprocessed" ON "raw_scraped_events" ("normalized");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_raw_platform" ON "raw_scraped_events" ("source_platform_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_search_documents_fts" ON "event_search_documents" ("document_tsvector");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_sources" ADD CONSTRAINT "event_sources_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_sources" ADD CONSTRAINT "event_sources_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_search_documents" ADD CONSTRAINT "event_search_documents_id_events_id_fk" FOREIGN KEY ("id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
