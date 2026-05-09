# Ingestion Pipeline

The ingestion pipeline is the heart of the Eventio platform. It is designed to be highly reliable, resilient to failure, and auditable.

## The 4-Stage Process

### 1. Scrapers (Extraction)
- **Responsibility**: Fetch data from external platforms (e.g., Codeforces, LeetCode, Meetup).
- **Rule**: Scrapers do NO normalization or deduplication. They strictly extract raw HTML/JSON and emit a structured raw payload.
- **Output**: Writes directly to the `raw_scraped_events` table in PostgreSQL.
- **Trigger**: Pushes a job to the `normalization` queue.

### 2. Normalization Workers
- **Responsibility**: Convert `raw_payload` into the canonical Eventio schema.
- **Tasks**:
  - Title normalization and timezone conversion to UTC.
  - Consistent date/time parsing.
  - Platform field mapping (e.g., standardizing URL fields).
  - Tag and organizer extraction.
- **Output**: Passes a normalized JSON object to the dedupe service.

### 3. Dedupe Service
- **Responsibility**: Identify if the event already exists in the system across different platforms.
- **Strategy**:
  - Compare canonical URLs, title similarity, organizer similarity, and date overlaps.
  - Generate a `dedupe_hash`.
- **Output**: Inserts or updates the canonical `events` table and links the platform in the `event_sources` table.

### 4. Search Indexing
- **Responsibility**: Denormalize the canonical event into a read-optimized format.
- **Task**: Pushes the cleaned event into PostgreSQL Full Text Search / Typesense index via the `indexing` queue.
