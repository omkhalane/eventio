-- Migration: Initial schema creation
-- Created at: 2026-05-08
-- Tables: raw_scraped_events, scraper_runs, scraper_failures, pipeline_failures

CREATE TABLE IF NOT EXISTS raw_scraped_events (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  scraper_version TEXT NOT NULL,
  source_event_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  raw_html TEXT,
  screenshot_url TEXT,
  scraped_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processing_key TEXT NOT NULL
);

CREATE INDEX idx_raw_scraped_events_platform ON raw_scraped_events(platform);
CREATE INDEX idx_raw_scraped_events_processing_key ON raw_scraped_events(processing_key);
CREATE INDEX idx_raw_scraped_events_source_id ON raw_scraped_events(source_event_id);
CREATE UNIQUE INDEX idx_raw_scraped_events_processing_key_unique ON raw_scraped_events(processing_key);

CREATE TABLE IF NOT EXISTS scraper_runs (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  scraper_version TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  duration_ms INTEGER,
  status VARCHAR(50) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scraper_runs_platform ON scraper_runs(platform);
CREATE INDEX idx_scraper_runs_status ON scraper_runs(status);

CREATE TABLE IF NOT EXISTS scraper_failures (
  id TEXT PRIMARY KEY,
  scraper_run_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  source_event_id TEXT,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scraper_failures_scraper_run_id ON scraper_failures(scraper_run_id);
CREATE INDEX idx_scraper_failures_platform ON scraper_failures(platform);

CREATE TABLE IF NOT EXISTS pipeline_failures (
  id TEXT PRIMARY KEY,
  raw_event_id TEXT,
  stage VARCHAR(100) NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  retry_count INTEGER DEFAULT 0,
  failed_payload JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pipeline_failures_stage ON pipeline_failures(stage);
CREATE INDEX idx_pipeline_failures_raw_event_id ON pipeline_failures(raw_event_id);
