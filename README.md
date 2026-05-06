# Eventio

Developer event intelligence in one calendar: coding contests, hackathons,
AI competitions, security challenges, startup programs, and tech events from
many public sources.

Eventio is a monorepo for an event aggregation platform. It includes a React
web app, a Python scraper service, SEO-ready public metadata, and contributor
tooling for growing the source catalog safely.

Maintainer: [Om Khalane](https://github.com/omkhalane)  
Repository: [github.com/omkhalane/eventio](https://github.com/omkhalane/eventio)  
Contact: [om.khalane.dev@gmail.com](mailto:om.khalane.dev@gmail.com)

## Why This Exists

Developers should not need to check Codeforces, LeetCode, Devpost, MLH,
Kaggle, AIcrowd, Unstop, Devfolio, and dozens of event pages manually. Eventio
normalizes those sources into a searchable, calendar-first experience.

Suggested badges for the public repository once CI is enabled:

- CI status
- License
- Open issues
- Good first issues
- Last commit

## Repository Layout

```text
apps/web/             React + Vite user-facing calendar app
services/scraper/     Python scraper service and source adapters
docs/                 Architecture, setup, scraping, SEO, and scaling notes
infra/                Future deployment and scheduled-job definitions
packages/             Future shared packages when duplication justifies them
.github/              CI, issue templates, and PR workflow
```

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Run quality checks:

```bash
npm run check
```

List scraper sources:

```bash
npm run scraper:list
```

Run one scraper:

```bash
python -m services.scraper.main --source aicrowd --output /tmp/aicrowd.json
```

## Tech Stack

- Web: React 19, TypeScript, Vite, Tailwind CSS, Motion
- Auth and data: Firebase Auth, Supabase
- Scraping: Python, requests, BeautifulSoup, optional Selenium fallback
- Tooling: npm scripts, TypeScript checks, Python compile checks, GitHub Actions

## SEO and Discovery

Eventio targets searches around developer events, coding contests, hackathons,
competitive programming calendar, AI competitions, tech conferences, and hiring
challenges. The web app includes primary metadata, Open Graph tags, Twitter
cards, robots.txt, sitemap.xml, and JSON-LD.

See [docs/seo.md](docs/seo.md) for the discoverability plan.

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md), then read
[docs/scraping.md](docs/scraping.md) before adding a new source.

## License

MIT. See [LICENSE](LICENSE).
