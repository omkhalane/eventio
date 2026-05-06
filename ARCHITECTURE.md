# Architecture

Eventio is organized as a small but scalable event aggregation system.

## System Boundaries

```text
Public sources
  -> scraper adapters
  -> normalized event records
  -> database
  -> web app
  -> calendar/search/sync experience
```

## Monorepo Boundaries

- `apps/web`: user-facing product. It owns rendering, routing, metadata, and
  client integrations.
- `services/scraper`: source-specific adapters plus shared scraping helpers.
  It should not import frontend code.
- `docs`: contributor knowledge and operating guidance.
- `infra`: deployment and scheduled job definitions. Keep provider-specific
  configuration here instead of scattering it through app code.
- `packages`: reserved for shared code only when there is real reuse across
  apps or services.

## Scraper Contract

Each scraper exposes a no-argument `fetch_*` function where possible and returns
a list of normalized event dictionaries. The normalized shape should include:

- `title`
- `platform`
- `external_id`
- `start_time`
- `end_time`
- `timezone`
- `event_type`
- `tags`
- `is_online`
- `city`
- `country`
- `url`
- `status`
- `extra`

## Data Flow

1. Scheduled job runs selected scraper sources.
2. Source adapters fetch remote pages or APIs with bounded retries.
3. Adapters normalize source records into the common event schema.
4. Pipeline deduplicates by stable `external_id`.
5. Storage layer upserts records into the database.
6. Web app reads events and renders calendar/list views.

The storage upsert layer is the next major boundary to formalize.

## Scaling Principles

- Add a source as an adapter, not as a special case in the runner.
- Treat flaky sources as isolated failures.
- Prefer static HTTP and JSON-LD extraction before browser automation.
- Keep event normalization deterministic and testable.
- Move shared logic to `packages` only after two consumers need it.
