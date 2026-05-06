# Eventio

[![CI](https://github.com/omkhalane/eventio/actions/workflows/lint.yml/badge.svg)](https://github.com/omkhalane/eventio/actions/workflows/lint.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Repository](https://img.shields.io/badge/GitHub-omkhalane%2Feventio-black)](https://github.com/omkhalane/eventio)

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

## Features

- Unified calendar for developer events and competitions.
- Source adapters for competitive programming, hackathons, AI competitions,
  conferences, and hiring challenges.
- React + TypeScript frontend with calendar and list views.
- Python scraper service with reusable retry and deduplication helpers.
- SEO-ready metadata, sitemap, robots.txt, Open Graph, and JSON-LD.
- GitHub issue templates, CI workflows, security policy, and contribution docs.

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
python3 -m services.scraper.main --source aicrowd --output /tmp/aicrowd.json
```

## Tech Stack

- Web: React 19, TypeScript, Vite, Tailwind CSS, Motion
- Auth and data: Firebase Auth, Supabase
- Scraping: Python, requests, BeautifulSoup, optional Selenium fallback
- Tooling: npm scripts, TypeScript checks, Python compile checks, GitHub Actions

## Documentation

- [Architecture](ARCHITECTURE.md)
- [Setup](docs/setup.md)
- [Scraping guide](docs/scraping.md)
- [Data flow](docs/data-flow.md)
- [Scaling notes](docs/scaling.md)
- [SEO and discoverability](docs/seo.md)
- [Tooling recommendations](docs/tooling.md)
- [Asset strategy](docs/asset-strategy.md)
- [Vercel deployment](docs/vercel.md)

## Community

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)
- [Governance](GOVERNANCE.md)
- [Changelog](CHANGELOG.md)

## License

MIT. See [LICENSE](LICENSE).
