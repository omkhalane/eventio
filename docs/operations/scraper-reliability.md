# Scraper Reliability

Scraping third-party event platforms is inherently brittle. Eventio implements several patterns to ensure long-term reliability.

## 1. Defense in Depth

### API over HTML
Whenever possible, scrapers target undocumented internal APIs rather than parsing HTML.
- **Why**: JSON structures change far less frequently than DOM structures (CSS classes, React IDs).
- **How**: Use browser dev tools (Network tab) to find the source JSON payloads requested by the target platform's frontend.

### The Raw Storage Buffer
- **Pattern**: Scrapers *only* fetch and dump. They do not parse.
- **Benefit**: If a platform changes their date format, the scraper still succeeds in fetching the data. The *Normalization* worker fails instead. This preserves the historical data fetch and allows us to fix the parser and replay the raw payload retroactively.

## 2. Handling Anti-Bot Measures

- **User-Agent Rotation**: Scrapers should use randomized, realistic User-Agents.
- **Concurrency Limits**: Do not parallelize scrapers for the same platform. Use a concurrency of `1` for the scraping queue to respect rate limits.
- **Staggered Crons**: Do not trigger all platform scrapers at the exact same minute. Stagger them using the scheduler.

## 3. Anomaly Detection

Set up alerts for the following anomalies, which usually indicate a broken scraper:
- `events_scraped == 0` for a platform over a 24-hour period.
- Sudden 50% drop in expected payload size.
- Repeated 403 Forbidden errors indicating IP block or WAF rules update.
