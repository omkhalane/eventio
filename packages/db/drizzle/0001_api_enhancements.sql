ALTER TABLE IF EXISTS "event_search_documents"
  ADD COLUMN IF NOT EXISTS "organizer_text" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_search_documents_title" ON "event_search_documents" ("title");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_search_documents_start_time" ON "event_search_documents" ("start_time");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_end_time" ON "events" ("end_time");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_created_at" ON "events" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_updated_at" ON "events" ("updated_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_search_documents_platforms_json" ON "event_search_documents" USING GIN ("platforms_json");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_search_documents_tags_json" ON "event_search_documents" USING GIN ("tags_json");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_start_end_time" ON "events" ("start_time", "end_time");
