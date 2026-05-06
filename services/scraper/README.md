# Scraper Service

Python service for collecting public developer events from source adapters.

## Commands

```bash
python -m services.scraper.main --list
python -m services.scraper.main --source codeforces --output /tmp/events.json
```

## Layout

```text
main.py           CLI runner and scraper discovery
scraper_utils.py  shared HTTP retry and dedup helpers
scrapers/         source adapters
requirements.txt  Python runtime dependencies
```

See [../../docs/scraping.md](../../docs/scraping.md) for the adapter contract.
