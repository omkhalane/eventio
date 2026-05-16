# Architecture

Eventio is a modular TypeScript monorepo. The repo is shaped around three runtime surfaces and a set of shared packages that keep data contracts consistent across ingestion, API, and UI.

```text
apps/web      Browser experience and optional web server
apps/api      Fastify API server
apps/workers  Scraper and background job entrypoints
packages/*    Shared infrastructure, data, and domain modules
```

## System Goals

- Keep the frontend fast, visually rich, and deployable independently.
- Keep API behavior reusable from both `apps/api` and `apps/web/server.ts`.
- Keep scraper code isolated from UI concerns.
- Normalize source-specific data into stable internal records.
- Make local development simple with pnpm and Docker Compose.
- Avoid committing generated scraper output, build folders, logs, and temp files.

## Runtime Boundaries

| Runtime | Path | Responsibility |
| --- | --- | --- |
| Web | `apps/web` | React routes, calendar UI, SEO metadata, public assets, Google Calendar sync client. |
| API | `apps/api` | Health check, CORS, API auth hook, security headers, `/api/v1/*` handling. |
| Workers | `apps/workers` | Run scrapers manually or through scheduled/background entrypoints. |
| Database | `packages/db` | Drizzle schema, migrations, database client exports. |
| Scrapers | `packages/scraper-core` | Source-specific fetchers plus shared scraper utilities. |

## Data Flow

```text
External event sources
        |
        v
Scraper implementation
        |
        v
Worker runner
        |
        v
Normalization and dedupe
        |
        v
PostgreSQL tables managed by Drizzle
        |
        v
Fastify API and reusable event API handler
        |
        v
React calendar, search, event modal, and docs UI
```

## API Composition

`apps/api/src/index.ts` owns the standalone API server:

- loads validated config,
- registers CORS,
- attaches auth and security-header hooks,
- exposes `GET /healthz`,
- routes API traffic into `handleApiRequest`.

`apps/api/lib/event-api.ts` owns the route behavior that can be reused from other runtimes. `apps/web/server.ts` imports it so the web server can expose matching API behavior when needed.

## Frontend Composition

`apps/web/src/App.tsx` coordinates route-level state for the calendar application. UI is split into focused components:

- `LandingPage` for the public first impression.
- `TopNav` and `Footer` for shell navigation.
- `MainCalendar` and `MiniCalendar` for event browsing.
- `EventModal` for event details, sharing, bookmarking, and calendar sync.
- `ApiDocs` for in-product API documentation.
- `SeoHead` for metadata management.

Public images and manifest assets live in `apps/web/public`.

## Ingestion Composition

Worker scripts in `apps/workers/src/scripts` call scraper modules from `packages/scraper-core/src`.

Current scraper modules include sources such as:

- AtCoder
- CodeChef
- Devpost
- GeeksforGeeks
- MLH
- Unstop

Local scraper exports are written beneath `scraper-output` by the scraper output helper. These exports are debugging artifacts and are ignored by Git.

## Configuration

Configuration starts in `.env.example`, flows through `@eventio/config`, and is consumed by runtime apps.

Important runtime inputs:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `REDIS_URL`
- `PUBLIC_SITE_URL`
- `PUBLIC_API_BASE_URL`
- `PUBLIC_API_KEYS`
- `INTERNAL_API_KEYS`
- `PUBLIC_FIREBASE_*`
- `PUBLIC_POSTHOG_*`

The project separates server-only secrets from browser-readable `PUBLIC_*` values. Treat every non-public key as secret.

## Local Infrastructure

Docker Compose provides local stateful dependencies:

```text
postgres  PostgreSQL 16 for event data
redis     Redis 7 for queue/cache support
pgbouncer Optional connection pooler profile
api       Optional containerized API profile
```

Default development usually starts only PostgreSQL and Redis:

```bash
docker compose up -d
```

The app itself is commonly run with pnpm for fast iteration:

```bash
pnpm dev
```

## Build And Quality

The root scripts are intentionally small:

```bash
pnpm lint
pnpm build
pnpm test
pnpm check
```

`pnpm check` currently maps to lint because that is also the pre-push quality gate.

## Deployment Shape

Eventio can be deployed as separate surfaces:

- Web app to a static/edge-friendly host.
- API to a Node.js host or container platform.
- PostgreSQL to a managed database provider.
- Redis to a managed Redis provider.
- Workers to a scheduled job runner, queue worker, or container process.

The Docker image is optimized for the API runtime. Local Compose keeps app containers behind profiles so the default stack remains lightweight.

## Repository Hygiene

The repo intentionally ignores:

- `node_modules/`
- `dist/`
- `apps/*/dist/`
- `.vite/`
- `coverage/`
- `playwright-report/`
- `test-results/`
- `apps/workers/scraper-output/`
- local env files and logs

Generated outputs should be recreated from source, not committed.
