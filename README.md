<div align="center">
  <img src="apps/web/public/assets/banner.png" alt="Eventio banner" width="100%" />

  <h1>Eventio</h1>

  <p>
    <strong>A polished event intelligence platform for developers, builders, and technical communities.</strong>
    <br />
    Eventio discovers developer events across the web, normalizes them into one reliable schema, and serves them through a fast API and a beautiful calendar experience.
  </p>

  <p>
    <a href="https://github.com/omkhalane/eventio/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-0f766e.svg" /></a>
    <img alt="Node.js 20+" src="https://img.shields.io/badge/node-20%2B-16a34a.svg" />
    <img alt="pnpm workspace" src="https://img.shields.io/badge/workspace-pnpm-f59e0b.svg" />
    <img alt="TypeScript" src="https://img.shields.io/badge/typescript-strict-2563eb.svg" />
    <img alt="React 19" src="https://img.shields.io/badge/react-19-06b6d4.svg" />
  </p>
</div>

---

## What Eventio Does

Eventio is a full-stack TypeScript monorepo that turns scattered developer opportunities into a clean, searchable event graph.

It focuses on:

- Coding contests and competitive programming rounds.
- Hackathons and build weekends.
- Developer workshops, AI/data events, and technical community programs.
- API-first access to normalized event data.
- Calendar-first discovery for humans.

The product experience lives in `apps/web`. The ingestion and backend pipeline lives across `apps/api`, `apps/workers`, and the shared `packages/*` workspace modules.

<p align="center">
  <img src="apps/web/public/assets/hero.png" alt="Eventio hero preview" width="88%" />
</p>

## Product Highlights

| Area | What You Get |
| --- | --- |
| Discovery | A calendar UI for browsing upcoming, ongoing, and past developer events. |
| Search | API query support for platform, category, status, pagination, and sorting. |
| Ingestion | Worker scripts that run scraper modules and write local scraper exports when needed. |
| Normalization | Shared packages for shaping source data into canonical event records. |
| Persistence | PostgreSQL schema and migrations managed through Drizzle. |
| Operations | Docker Compose for local PostgreSQL/Redis, health checks, lint hooks, and pnpm workspace scripts. |

## Architecture At A Glance

```text
Source platforms
      |
      v
Scraper modules -> worker scripts -> raw/normalized event data
      |
      v
Deduplication + normalization packages
      |
      v
PostgreSQL + Drizzle schema
      |
      v
Fastify API -> React/Vite web app
```

The system is intentionally modular: scrapers can evolve independently, API behavior is centralized, and the frontend can point at any compatible API base URL through public runtime config.

## Monorepo Map

```text
apps/
  api/              Fastify API for health checks and /api/v1 routes
  web/              React 19 + Vite frontend, SEO assets, calendar UI
  workers/          Scraper runner and scheduled background entrypoints

packages/
  config/           Environment loading and validation helpers
  db/               Drizzle schema, database client, migrations
  dedupe/           Event duplicate detection primitives
  normalization/    Event shaping and cleanup package
  observability/    Structured logging
  queue/            BullMQ and Redis connection utilities
  scraper-core/     Platform scrapers and scraper output helpers
  search/           Search-related workspace package
  shared/           Shared TypeScript types

tests/
  e2e/              Playwright browser smoke tests
```

## Quick Start

### 1. Install Requirements

- Node.js `20+`
- pnpm `8+`
- Docker Desktop or Docker Engine, if you want local PostgreSQL and Redis

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
```

### 2. Create Local Environment

```bash
cp .env.example .env
```

For the default Docker Compose stack, these values are enough:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eventio
DIRECT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eventio
REDIS_URL=redis://localhost:6379
PUBLIC_SITE_URL=http://localhost:5175
PUBLIC_API_BASE_URL=http://localhost:3000
```

### 3. Start Infrastructure

```bash
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

Optional API container:

```bash
docker compose --profile app up --build api
```

Optional PgBouncer pooler:

```bash
docker compose --profile pooling up -d pgbouncer
```

### 4. Prepare The Database

```bash
pnpm db:push
```

### 5. Run The App

```bash
pnpm dev
```

Common local URLs:

| Surface | URL |
| --- | --- |
| Web app | `http://localhost:5175` or the Vite URL printed in your terminal |
| API health | `http://localhost:3000/healthz` |
| API v1 | `http://localhost:3000/api/v1/...` |
| In-app API docs | `http://localhost:5175/docs` |

## Common Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run workspace development scripts in parallel. |
| `pnpm build` | Build all packages/apps that expose a build script. |
| `pnpm lint` | Run ESLint across workspace packages. |
| `pnpm test` | Run package test scripts where present. |
| `pnpm check` | Run the default pre-push quality check. |
| `pnpm db:push` | Apply Drizzle schema changes to the configured database. |
| `pnpm db:generate` | Generate a Drizzle migration. |
| `pnpm scrape:trigger` | Trigger a worker scraper entrypoint. |
| `pnpm scrape:run` | Run scraper modules through the worker script. |
| `pnpm scrape:run:ci` | Run scraper modules in CI-friendly mode. |

## API Shape

The Fastify server exposes:

```text
GET /healthz
GET /api/v1/*
POST /api/v1/*
```

The route implementation delegates to `apps/api/lib/event-api.ts`, which keeps API behavior reusable by both the standalone API server and the web server integration.

Typical filters include:

- `platform`
- `category`
- `status`
- `sort`
- `order`
- pagination inputs

See the in-app docs at `/docs` for request examples.

## Environment Guide

Use `.env.example` as the source of truth. Important groups:

| Group | Variables |
| --- | --- |
| App runtime | `NODE_ENV`, `HOST`, `PORT`, `API_HOST`, `API_PORT`, `LOG_LEVEL` |
| Public URLs | `PUBLIC_SITE_URL`, `PUBLIC_API_BASE_URL` |
| Database | `DATABASE_URL`, `DIRECT_DATABASE_URL` |
| Queue/cache | `REDIS_URL` |
| API auth/rate limits | `PUBLIC_API_KEYS`, `INTERNAL_API_KEYS`, `PUBLIC_RATE_LIMIT_PER_MINUTE`, `ANONYMOUS_RATE_LIMIT_PER_MINUTE` |
| Browser integrations | `PUBLIC_FIREBASE_*`, `PUBLIC_POSTHOG_*` |

Never commit real secrets. Keep local credentials in `.env`, deployment secrets in the deployment platform, and examples in `.env.example`.

## Docker Notes

The Docker setup is split into two useful paths:

- `docker compose up -d` for local infrastructure only.
- `docker compose --profile app up --build api` for a containerized API smoke run.

The `Dockerfile` builds the workspace, keeps runtime process handling through `dumb-init`, exposes port `3000`, and runs `@eventio/api` through the workspace start script.

## Scraper Notes

Scraper code lives in `packages/scraper-core/src`. Worker entrypoints live in `apps/workers/src`.

Local scraper JSON exports are intentionally ignored:

```text
apps/workers/scraper-output/
```

That directory is useful for debugging source behavior, but it should not be committed.

## Quality Bar

Before opening a pull request or pushing shared work, run:

```bash
pnpm lint
pnpm build
```

For UI changes, run the app and capture screenshots. For API or ingestion changes, include sample requests, source notes, or representative payloads.

## Documentation

| Document | Purpose |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, runtime boundaries, and data flow. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Local setup, branch rules, PR standards, and contribution workflow. |
| [SECURITY.md](SECURITY.md) | Vulnerability reporting and security scope. |
| [SUPPORT.md](SUPPORT.md) | Where to ask for help and what to include. |
| [GOVERNANCE.md](GOVERNANCE.md) | Maintainer responsibilities and decision-making model. |
| [CHANGELOG.md](CHANGELOG.md) | Project history and unreleased notes. |
| [apps/web/README.md](apps/web/README.md) | Frontend-specific guide. |

## Maintainer

Eventio is maintained by [Om Khalane](https://github.com/omkhalane).

- Portfolio: [omkhalane.dev](https://omkhalane.dev)
- Repository: [github.com/omkhalane/eventio](https://github.com/omkhalane/eventio)
- Security: see [SECURITY.md](SECURITY.md)

## License

MIT. See [LICENSE](LICENSE).

---

<div align="center">
  <sub>Built for developers who would rather discover the next useful event than dig through ten tabs to find it.</sub>
</div>
