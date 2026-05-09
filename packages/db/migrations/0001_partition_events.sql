-- Task 23: partition events by month(start_at)
-- Note: convert existing events table to partitioned parent if needed.

CREATE TABLE IF NOT EXISTS events_partitioned (
  LIKE events INCLUDING ALL
) PARTITION BY RANGE (start_at);

-- Example rolling partitions (create monthly in scheduler)
CREATE TABLE IF NOT EXISTS events_2026_01 PARTITION OF events_partitioned
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS events_2026_02 PARTITION OF events_partitioned
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS events_2026_03 PARTITION OF events_partitioned
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Optional default partition as safety net
CREATE TABLE IF NOT EXISTS events_default PARTITION OF events_partitioned DEFAULT;

-- Indexes on parent propagate to partitions in PG 11+
CREATE INDEX IF NOT EXISTS idx_events_part_category_start ON events_partitioned(category_id, start_at);
CREATE INDEX IF NOT EXISTS idx_events_part_status_start ON events_partitioned(status, start_at);
CREATE INDEX IF NOT EXISTS idx_events_part_platform_start ON events_partitioned(platform_id, start_at);
