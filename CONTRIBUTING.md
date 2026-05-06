# Contributing

Thanks for helping make Eventio useful for developers.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

For scraper work:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r services/scraper/requirements.txt
python -m services.scraper.main --list
```

## Quality Checks

Run before opening a PR:

```bash
npm run check
npm run build
```

## Adding a Scraper

1. Add a file under `services/scraper/scrapers/`.
2. Expose a no-argument `fetch_source_name()` function when possible.
3. Return normalized events, not raw source payloads.
4. Use `services.scraper.scraper_utils` for retries and deduplication.
5. Keep Selenium as a fallback, not the first option.
6. Document unusual source behavior in `docs/scraping.md`.

## Pull Request Expectations

- Keep changes scoped.
- Do not commit generated caches, local output JSON, virtual environments, or
  build artifacts.
- Include screenshots for visible UI changes.
- Include source links or sample payload notes for scraper changes.
- Update docs when changing architecture, setup, or data contracts.
