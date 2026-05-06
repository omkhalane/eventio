# Contributing

Thanks for helping make Eventio useful for developers. This project values
focused changes, clear reasoning, and respectful collaboration.

## Ways to Contribute

- Fix bugs in the web app.
- Add or improve scraper sources.
- Improve event normalization and data quality.
- Strengthen documentation.
- Improve CI, tooling, accessibility, SEO, and developer experience.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

For scraper work:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r services/scraper/requirements.txt
python3 -m services.scraper.main --list
```

## Quality Checks

Run before opening a PR:

```bash
npm run typecheck
npm run build
npm run scraper:check
```

## Branches and Commits

- Keep branches focused on one change.
- Use clear commit messages such as `fix: handle empty event dates` or
  `docs: clarify scraper contract`.
- Do not commit generated files, local caches, secrets, or virtual
  environments.

## Adding a Scraper

1. Add a file under `services/scraper/scrapers/`.
2. Prefer a no-argument `fetch_source_name()` function.
3. Return normalized events, not raw payloads.
4. Use `services.scraper.scraper_utils` for retries and deduplication.
5. Prefer APIs, JSON-LD, and static HTML before Selenium.
6. Document unusual source behavior in `docs/scraping.md`.

## Pull Request Checklist

- The PR explains why the change is needed.
- Tests or checks were run and listed.
- Screenshots are included for visible UI changes.
- Source notes are included for scraper changes.
- Docs are updated for setup, architecture, schema, or behavior changes.

## Security

Do not open public issues for vulnerabilities. Follow [SECURITY.md](SECURITY.md).
