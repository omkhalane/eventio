# Eventio API

Base URL (production): https://event-io.me/api/v1

Local development base URL: http://localhost:3000/api/v1

## Endpoints

- `GET /stats` — global upcoming/past counts
- `GET /events` — paginated event search and filters

## Query Parameters

- `platforms` — comma-separated platform IDs
- `categories` — comma-separated event categories
- `search` — full-text query
- `startDate` / `endDate` — ISO-8601 date bounds

## Response Shape

All endpoints return JSON with typed `data` payloads and standard HTTP status codes. Pagination metadata is included where applicable.

## Examples

```bash
curl '${PUBLIC_API_BASE_URL:-https://event-io.me}/api/v1/events?search=hackathon'

# For local development:
curl 'http://localhost:3000/api/v1/events?search=hackathon'
```
