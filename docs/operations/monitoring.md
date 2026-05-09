# Monitoring and Observability

Eventio requires comprehensive visibility into its distributed ingestion pipeline and API.

## Logging

We use a centralized JSON structured logger defined in `packages/observability`.

- **Format**: All logs in production are output as JSON to ensure easy parsing by log aggregation tools.
- **Request IDs**: The Fastify API injects a unique `reqId` into every incoming request. This ID is passed along to any background jobs spawned by that request, ensuring full traceability.
- **Context**: Worker logs must always include `jobId`, `platform`, and `event_source_id`.

## Metrics to Track

### 1. Ingestion Pipeline Health
- `scraper_success_rate`: Percentage of successful scrapes per platform.
- `normalization_errors`: Count of payloads failing schema validation.
- `queue_depth`: Number of jobs waiting in `scraping`, `normalization`, and `indexing` queues. High queue depth indicates worker starvation or database locks.

### 2. API Health
- `http_response_time_ms`: 95th percentile latency of the search endpoint.
- `http_error_rate`: Count of 5xx responses.
- `cache_hit_ratio`: Effectiveness of Redis API caching.

## Tools Integration

### PostHog
- Used primarily for frontend analytics and user search behavior tracking.
- Helps identify "zero-result" searches to inform which platforms to scrape next.

### Sentry
- Integrated into the Fastify API and Node.js Worker processes.
- Captures unhandled promise rejections, out-of-memory errors, and database connection failures.
- **Alerting**: Critical alerts are configured for Sentry issues originating from the `normalization` package, as this indicates a breaking API change from a third-party platform.
