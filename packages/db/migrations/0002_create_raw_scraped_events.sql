-- Migration: create raw_scraped_events with full ingestion contract

CREATE TABLE IF NOT EXISTS raw_scraped_events (
  ingestion_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  event_schema_type TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE,
  source_url TEXT,
  event_source_id TEXT,
  event_source_url TEXT,
  raw_payload JSONB NOT NULL,
  artifacts JSONB,
  scraper_metrics JSONB,
  execution JSONB,
  http_metadata JSONB,
  payload_size_bytes INTEGER,
  hashes JSONB,
  metadata JSONB,
  processing_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_raw_scraped_platform ON raw_scraped_events(platform);
CREATE INDEX IF NOT EXISTS idx_raw_scraped_processing_key ON raw_scraped_events(processing_key);
CREATE INDEX IF NOT EXISTS idx_raw_scraped_run_id ON raw_scraped_events(run_id);
CREATE INDEX IF NOT EXISTS idx_raw_scraped_created_at ON raw_scraped_events(created_at);
