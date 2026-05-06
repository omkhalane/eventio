# Scraping Guide

Scrapers are source adapters. They should convert messy external websites and
APIs into Eventio's normalized event contract.

## Source Adapter Rules

- Put adapters in `services/scraper/scrapers`.
- Prefer a no-argument `fetch_<source>()` function.
- Return normalized event dictionaries.
- Use stable `external_id` values from the source whenever possible.
- Keep source-specific raw payloads in `extra.raw` only when useful for
  debugging.
- Use `request_json_with_retry` or `request_text_with_retry` from
  `services.scraper.scraper_utils`.
- Prefer static HTML/API/JSON-LD before Selenium.

## Normalized Event Fields

```text
title, platform, external_id, start_time, end_time, timezone, event_type,
tags, is_online, city, country, url, is_free, price, currency, status, extra
```

## Failure Handling

Scrapers should fail locally and visibly. A broken source should not prevent the
whole scheduled job from reporting which source failed.

Next improvement: add per-source result objects with `source`, `status`,
`events_count`, `duration_ms`, and `error`.

## Naming

Use clear source names:

- `codeforces_scraper.py`
- `aicrowd_source_scraper.py`
- `google_developers_source_scraper.py`

Avoid vague names like `main.py`, `helper.py`, or `new_scraper.py`.
