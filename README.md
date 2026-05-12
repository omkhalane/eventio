<div align="center">
  <h1>Eventio</h1>

  <p>
    <strong>A production-grade scalable event intelligence platform.</strong>
    <br />
    Aggregate, normalize, and serve developer event data reliably across multiple sources.
  </p>
</div>

## Architecture Overview

Eventio is structured as a modular monolith monorepo, optimized for reliable data ingestion, strict normalization, and blazing fast frontend performance.

The pipeline architecture:
**Scrapers** -> **PostgreSQL Raw Storage** -> **Normalization Workers** -> **Dedupe Service** -> **PostgreSQL Canonical Tables** -> **Search Index** -> **API** -> **React Frontend**

## Monorepo Layout

```text
apps/
  web/         # React + Vite + Tailwind frontend
  api/         # Fastify API (Reads only)
  workers/     # BullMQ background processors (Writes & Ingestion)

packages/
  db/          # Drizzle ORM schemas and migrations
  queue/       # BullMQ and Redis connections
  shared/      # Common TypeScript types
  scraper-core/# Scraper base interfaces
  normalization/# Schema parsers
  dedupe/      # Identity matching logic
  search/      # Search abstraction layer
  config/      # Env var validation
  observability/# Structured JSON logging

infra/
  docker/      # Container configurations
  scripts/     # Helper bash scripts
  railway/     # Deployment templates
  neon/        # Postgres setup scripts

docs/
  architecture/# System and Database designs
  setup/       # Local and cloud setup instructions
  deployment/  # Production and scaling guides
  operations/  # Monitoring and debugging runbooks
```

## Setup Instructions

See [API docs](API.md), [Deployment](DEPLOYMENT.md), [Architecture](ARCHITECTURE.md), and [SEO](SEO.md) for the production-ready overview.

## Quick Start

1. Start Postgres and Redis:
   ```bash
   docker-compose up -d
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start all applications (Migrations and scrapers run automatically on startup!):
   ```bash
   pnpm dev
   ```
4. Open the main app at https://event-io.me/ or the interactive docs at https://event-io.me/docs.

## Features

- **Automated Scrapers**: Built-in workers automatically fetch data from **Codeforces** and **LeetCode**, normalize the payload, and insert into the database.
- **Advanced Backend API Filtering**: Fetch events using Drizzle ORM and Postgres JSONB logic. Filter by:
  - `platforms` (e.g. ?platforms=codeforces,leetcode)
  - `categories` (e.g. ?categories=competitive-programming)
  - `search` text
  - `startDate` & `endDate`
- **Dynamic Frontend Dashboard**: The React frontend passes user selections directly to the Fastify API.
- **Interactive API Documentation**: Explore the API specifications directly from the UI by navigating to `/api-docs`.

## Documentation

Please refer to the `docs/` directory for detailed engineering standards:

- **Architecture:** [System Overview](docs/architecture/system-overview.md)
- **Deployment:** [Production Strategy](docs/deployment/production-deployment.md)
- **Operations:** [Scraper Reliability](docs/operations/scraper-reliability.md)

## Contact

For support or security reports, email: contact@event-io.me
