# Data Flow

## Current Flow

```text
source website/API
  -> scraper module
  -> normalized event list
  -> deduplication by external_id
  -> future database upsert
  -> Supabase query from web app
  -> calendar UI
```

## Near-Term Storage Contract

The scraper runner should write to a storage adapter instead of writing ad hoc
JSON files from individual source modules. The storage adapter should own:

- validation
- deduplication keys
- upsert behavior
- source run metadata
- error reporting

## Observability

Every scheduled scrape should emit:

- run id
- source name
- started and finished timestamps
- event count
- insert/update count
- warning count
- failure reason, when present
