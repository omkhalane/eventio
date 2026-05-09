# Database Design

Eventio uses PostgreSQL as the single source of truth, specifically optimized for Neon (serverless Postgres). We use Drizzle ORM for type-safe schema definitions.

## Core Schema Structure

### Raw Storage
- `raw_scraped_events`: Stores exactly what scrapers return before any processing.
  - `id` (UUID)
  - `source_platform_id` (VARCHAR)
  - `source_url` (VARCHAR)
  - `raw_payload` (JSONB)
  - `scraped_at` (TIMESTAMP)
  - `normalized` (BOOLEAN)
  - `normalization_error` (TEXT)

### Canonical Entities
- `events`: The single normalized representation of an event.
  - `id` (UUID)
  - `title` (VARCHAR)
  - `description` (TEXT)
  - `start_time` (TIMESTAMP WITH TIME ZONE)
  - `end_time` (TIMESTAMP WITH TIME ZONE)
  - `timezone` (VARCHAR)
  - `canonical_url` (VARCHAR)
  - `dedupe_hash` (VARCHAR) - Unique constraint.
- `platforms`: Represent platforms like Codeforces, LeetCode, etc.
- `organizers`: Event hosts or companies.
- `categories` & `tags`: Classification system.
- `technologies`: Tech stack associated with events.

### Junction Tables (Many-to-Many)
- `event_sources`: Links canonical `events` to their respective platforms and raw source URLs. Allows one event to have multiple sources (e.g., posted on Meetup and Eventbrite).
- `event_tags`, `event_technologies`, `event_organizers`.

### Read Models
- `event_search_documents`: A denormalized table heavily indexed for search, filtering, and API reads.
  - Uses `GIN` indexes on text columns for PostgreSQL full-text search.

## Indexing Strategy
- No generic `OFFSET` pagination for large tables. Cursor-based pagination (using `id` or `start_time`) is mandatory.
- Composite indexes on frequently queried combinations like `(platform_id, start_time)`.
