# Typesense Setup (Phase 2)

While Eventio starts with PostgreSQL Full-Text Search, it is designed to migrate to Typesense when query volume or dataset size demands it.

## 1. Local Setup
```bash
docker run -d -p 8108:8108 -v /tmp/typesense-data:/data \
  typesense/typesense:0.25.1 \
  --data-dir /data \
  --api-key=xyz \
  --enable-cors=true
```
Add to `.env`:
```env
TYPESENSE_API_KEY="xyz"
TYPESENSE_URL="http://localhost:8108"
```

## 2. Cloud Setup (Typesense Cloud)
1. Go to [Typesense Cloud](https://cloud.typesense.org/).
2. Create a new cluster.
3. Generate an API Key (Search-only for Frontend, Admin for Workers).
4. Provide the Admin API key to the Worker instances so the `indexing` queue can upsert documents.
5. Provide the Search-only API key to the Frontend via the API service.

## 3. Index Schema
The Typesense schema mirrors the denormalized read model:
- `id` (string)
- `title` (string)
- `start_time` (int64 - Unix timestamp)
- `end_time` (int64 - Unix timestamp)
- `tags` (string[])
- `platform` (string)
- `url` (string)

## 4. Migration Strategy
1. The API's `SearchService` interface will seamlessly switch data sources from the Postgres FTS query to a Typesense query based on an environment toggle `SEARCH_PROVIDER=typesense`.
2. A script will trigger a bulk re-index of the `event_search_documents` table into Typesense.
