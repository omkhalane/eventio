<div align="center">
  <a href="https://eventio-sandy.vercel.app/">
    <img src="apps/web/public/assets/banner.png" alt="Eventio banner" width="100%" />
  </a>

  <h1>Eventio</h1>

  <p>
    <strong>Developer event intelligence in one fast calendar.</strong>
    <br />
    Track coding contests, hackathons, AI competitions, security challenges,
    startup programs, and tech events from public sources.
  </p>

  <p>
    <a href="https://github.com/omkhalane/eventio/actions/workflows/lint.yml"><img src="https://github.com/omkhalane/eventio/actions/workflows/lint.yml/badge.svg" alt="CI status" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT license" /></a>
    <a href="https://eventio-sandy.vercel.app/"><img src="https://img.shields.io/badge/Vercel-ready-black?logo=vercel" alt="Vercel ready" /></a>
    <a href="https://github.com/omkhalane/eventio"><img src="https://img.shields.io/badge/GitHub-omkhalane%2Feventio-black?logo=github" alt="Repository" /></a>
  </p>

  <p>
    <a href="https://eventio-sandy.vercel.app/">Live app</a>
    ·
    <a href="docs/setup.md">Setup</a>
    ·
    <a href="docs/vercel.md">Deploy</a>
    ·
    <a href="docs/scraping.md">Add a source</a>
    ·
    <a href="CONTRIBUTING.md">Contribute</a>
  </p>
</div>

## Overview

Eventio is an open-source event aggregation platform for developers. The repo
contains a React calendar app, a Python scraper service, production-ready public
assets, Vercel deployment config, SEO metadata, CI, Dependabot updates, and
contributor workflows.

The product goal is simple: developers should not need to manually check
Codeforces, LeetCode, AtCoder, Devpost, MLH, Kaggle, AIcrowd, Unstop, Devfolio,
and dozens of other pages to find what is worth joining next.

## Highlights

- Calendar-first React app with month, week, day, and list views.
- Search and filters for event type, platform, date, mode, and metadata.
- Google sign-in and Google Calendar event sync.
- Supabase client integration for event and user preference data.
- Python scraper registry with source adapters for contests, hackathons,
  conferences, competitions, and hiring challenges.
- Vercel static deployment with a serverless `/api/v1/health` endpoint.
- SEO assets: favicon, manifest, robots.txt, sitemap.xml, Open Graph image, and
  JSON-LD.
- GitHub Actions CI, Dependabot, and Dependabot auto-merge after checks pass.

## Repository Layout

```text
apps/web/             React + Vite calendar app and public assets
api/v1/health.ts      Vercel serverless health endpoint
services/scraper/     Python scraper runner, utilities, and source adapters
docs/                 Setup, deployment, scraping, SEO, scaling, and tooling
infra/                Placeholder for future provider-specific infrastructure
packages/             Placeholder for future shared packages
.github/              CI, Dependabot, issue templates, CODEOWNERS, PR template
```

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL printed by the command. It usually starts on
`http://127.0.0.1:5173/`, but Vite will pick the next open port if that one is
already in use. Commands are run from the repository root even though the
frontend source lives in `apps/web`.

## Environment

Copy `.env.example` to `.env` and fill in the values you need:

```text
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_APP_ID=
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID=
```

`PUBLIC_*` values are delivered to the browser at runtime from `/api/config`.
Keep private secrets such as `DATABASE_URL`, service-role keys, AI API keys, and
email provider keys in server-only variables without the `PUBLIC_` prefix.

The app can render without Supabase data, but event loading, user persistence,
Google authentication, and calendar sync require the matching Supabase and
Firebase provider setup. Google sign-in is handled through Firebase Auth.

## Scripts

```bash
npm run dev            # Start the Vite app
npm run build          # Build apps/web into dist/apps/web
npm run preview        # Preview the production build locally
npm run typecheck      # TypeScript check
npm run scraper:list   # List discovered scraper sources
npm run scraper:check  # Compile scraper modules
npm run check          # TypeScript + scraper checks
```

Run one scraper and write JSON output:

```bash
python3 -m services.scraper.main --source codeforces --output /tmp/codeforces.json
```

## Deployment

Eventio is configured for Vercel from the repo root.

```text
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist/apps/web
Node.js Version: 20.x
```

See [docs/vercel.md](docs/vercel.md) for the full dashboard, CLI, Firebase,
Google OAuth, Supabase, and verification checklist.

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

## Contributors

Contributions are welcome across UI, scrapers, docs, data quality, CI, SEO, and
deployment.

<a href="https://github.com/omkhalane/eventio/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=omkhalane/eventio" alt="Eventio contributors" />
</a>

This image updates automatically from GitHub contributor data.

## Community

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)
- [Governance](GOVERNANCE.md)
- [Changelog](CHANGELOG.md)

Maintainer: [Om Khalane](https://github.com/omkhalane)  
Repository: [github.com/omkhalane/eventio](https://github.com/omkhalane/eventio)  
Contact: [om.khalane.dev@gmail.com](mailto:om.khalane.dev@gmail.com)

## License

MIT. See [LICENSE](LICENSE).
