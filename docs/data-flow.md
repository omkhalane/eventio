# Data Flow

## Current Runtime Flow

```text
public source website/API
  -> Python scraper adapter
  -> normalized event dictionaries
  -> JSON output from services.scraper.main
  -> Supabase events table populated outside the frontend
  -> browser Supabase query
  -> calendar, search, filters, modal, and Google Calendar sync
```

The web app reads from Supabase directly in the browser through the public anon
key. It does not currently call a custom events API for event listing.

## Vercel Endpoint

The deployed app includes one serverless endpoint:

```text
GET /api/v1/health
```

It returns a small JSON health payload and is useful for deployment smoke tests.

## Scraper Runner

`services.scraper.main` discovers no-argument `fetch_*` functions from
`services/scraper/scrapers`, runs selected sources, deduplicates by stable event
identity through shared utilities, and writes JSON to stdout or an `--output`
file.

## Storage Gap

The repository does not yet contain a formal scheduled upsert worker that moves
scraper output into Supabase. That remains the main backend integration gap.

The future storage adapter should own:

- event validation
- deduplication keys
- Supabase upsert behavior
- source run metadata
- per-source error reporting

## Observability Target

Every scheduled scrape should eventually emit:

- run id
- source name
- start and finish timestamps
- event count
- insert and update count
- warning count
- failure reason, when present
