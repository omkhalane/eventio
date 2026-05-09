# Queue Architecture

Eventio utilizes **Redis** and **BullMQ** for robust, scalable background job processing. This architecture prevents API blocking and ensures resilience against third-party failures.

## Core Queues

1. **`scraping` Queue**
   - **Purpose**: Triggers individual scraper jobs (e.g., "Run Codeforces Scraper").
   - **Scheduling**: Managed by Railway cron or worker scheduler architecture.
   - **Concurrency**: Low to avoid rate limiting on target platforms.

2. **`normalization` Queue**
   - **Purpose**: Processes raw event payloads stored in `raw_scraped_events` into the canonical schema.
   - **Triggers**: Instantly upon a scraper completing a fetch and storing raw data.
   - **Concurrency**: High, CPU-bound parsing.

3. **`dedupe` Queue**
   - **Purpose**: Matches normalized events against existing canonical events.
   - **Concurrency**: Medium, database-heavy.

4. **`indexing` Queue**
   - **Purpose**: Pushes updated canonical records into the search system (PostgreSQL FTS/Typesense).

## Reliability Strategies
- **Retries with Exponential Backoff**: Transient network failures (e.g., scraper timeouts or DB blips) will automatically retry.
- **Dead Letter Queue (DLQ)**: Failed jobs after max retries are moved to a failed state. Alerts via Observability integrations.
- **Concurrency Control**: Prevents overwhelming the Neon database with too many simultaneous writes.
