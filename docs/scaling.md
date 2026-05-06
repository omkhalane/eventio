# Scaling Notes

## Scraper Scale

- Run sources independently so one flaky website does not block the catalog.
- Add timeouts and retry budgets per source.
- Store source run metadata for visibility.
- Cache expensive rendered pages when source terms allow it.
- Move high-volume sources to queued workers when scheduled runs become slow.

## Product Scale

- Add server-side APIs before putting complex data access in the client.
- Keep search/filter state URL-addressable for sharing and SEO.
- Add materialized views for popular slices such as hackathons, contests, and
  AI competitions.

## Monorepo Scale

Create packages only when there is real reuse:

- `packages/event-schema` for shared event contracts.
- `packages/config` for shared TypeScript configuration.
- `packages/ui` only if more than one frontend exists.
