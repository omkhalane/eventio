<div align="center">
  <h1>Eventio</h1>

  <p>
    <strong>A production-grade scalable event intelligence platform.</strong>
    <br />
    Aggregate, normalize, and serve developer event data reliably across multiple sources.
  </p>

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/omkhalane/eventio/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/node-v20+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.4+-blue)](https://www.typescriptlang.org/)

</div>

---

## Architecture Overview

Eventio is a production-grade event aggregation platform built with modern TypeScript, featuring a modular monolith architecture optimized for reliability, performance, and scalability.

### The Pipeline

```
Scrapers → Raw Storage → Normalization → Deduplication → Canonical DB → Search Index → API → Frontend
```

## Monorepo Layout

```
apps/
├── web/              # React 19 + Vite + Tailwind SPA
├── api/              # Fastify REST API (read-only)
└── workers/          # BullMQ background processors

packages/
├── db/               # Drizzle ORM schema & migrations
├── queue/            # BullMQ & Redis connections
├── config/           # Environment validation (Zod)
├── observability/    # Structured JSON logging
├── scraper-core/     # Platform-specific scrapers
├── dedupe/           # Duplicate detection logic
└── shared/           # Common TypeScript types

docs/
├── ARCHITECTURE.md   # System design details
├── DEPLOYMENT.md     # Deployment instructions
└── PRODUCTION.md     # Production checklist
```

## Quick Start

### Prerequisites

- **Node.js** v20+
- **pnpm** v8+ (`npm install -g pnpm`)
- **Docker** (for PostgreSQL & Redis)

### Setup

1. **Clone and install**:

   ```bash
   git clone https://github.com/omkhalane/eventio.git
   cd eventio
   pnpm install
   ```

2. **Start infrastructure**:

   ```bash
   docker-compose up -d
   ```

3. **Setup database**:

   ```bash
   pnpm db:push
   ```

4. **Start development**:

   ```bash
   pnpm dev
   ```

   Available at:
   - **Frontend**: http://localhost:5175
   - **API**: http://localhost:3000
   - **Docs**: http://localhost:5175/docs

### Trigger Scrapers

```bash
# Trigger specific platform
pnpm scrape:trigger codeforces

# Run all scrapers
pnpm scrape:run
```

## Supported Platforms

- **Competitive Programming**: Codeforces, LeetCode, AtCoder, CodeChef
- **Hackathons**: Devpost, MLH, Unstop, Devfolio
- **Hiring**: HackerRank, GeeksforGeeks
- More platforms added regularly!

## Key Features

✅ **Production-Ready** - Fully typed TypeScript, tested, documented  
✅ **Horizontally Scalable** - Stateless services, distributed queue processing  
✅ **Type-Safe** - 100% TypeScript across frontend, API, and workers  
✅ **Real-Time Ingestion** - BullMQ-powered asynchronous processors  
✅ **High Performance** - Optimized queries, smart caching, proper indexing  
✅ **Comprehensive Search** - Full-text search with advanced filtering  
✅ **Well Documented** - Architecture guides, API docs, deployment guides

## Technology Stack

| Layer          | Stack                                    |
| -------------- | ---------------------------------------- |
| **Frontend**   | React 19, TypeScript, Tailwind CSS, Vite |
| **API**        | Fastify, TypeScript, Node.js 20+         |
| **Workers**    | BullMQ, Redis, Node.js                   |
| **Database**   | PostgreSQL, Drizzle ORM                  |
| **Deployment** | Docker, Vercel, Railway, Neon            |

## Documentation

- **[API Documentation](API.md)** - REST endpoints and usage examples
- **[Architecture](ARCHITECTURE.md)** - System design and data flow
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment
- **[Production Setup](PRODUCTION.md)** - Pre-deployment checklist
- **[SEO Guide](SEO.md)** - SEO optimization details

## Environment Configuration

### Development

Pre-configured `.env` file for local development:

```bash
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eventio
REDIS_URL=redis://localhost:6379
PUBLIC_SITE_URL=http://localhost:5175
PUBLIC_API_BASE_URL=http://localhost:3000
```

### Production

See [PRODUCTION.md](PRODUCTION.md) for comprehensive production setup guide.

## Commands

```bash
# Development
pnpm dev              # Start all services
pnpm build            # Build production bundles
pnpm test             # Run test suite
pnpm lint             # Lint codebase

# Database
pnpm db:push          # Apply schema changes
pnpm db:generate      # Create migration

# Scrapers
pnpm scrape:trigger <platform>  # Trigger scraper
pnpm scrape:run                 # Run all scrapers

# Utilities
pnpm inspect-db       # View database contents
```

## Project Stats

- **Languages**: TypeScript (100%)
- **Frontend**: React 19 + Vite
- **Backend**: Fastify + Node.js 20+
- **Database**: PostgreSQL + Drizzle ORM
- **Queue**: BullMQ + Redis
- **Platforms**: 8+ event sources
- **API Endpoints**: 2 main endpoints
- **Rate Limit**: 120/min public, 30/min anonymous

## Support

- **Issues**: [GitHub Issues](https://github.com/omkhalane/eventio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/omkhalane/eventio/discussions)
- **Security**: See [SECURITY.md](SECURITY.md)
- **Email**: om.khalane.dev@gmail.com

## License

MIT - See [LICENSE](LICENSE) for details

## Author

**Om Khalane**  
Portfolio: [omkhalane.dev](https://omkhalane.dev)  
Twitter: [@omkhalane](https://twitter.com/omkhalane)  
Email: om.khalane.dev@gmail.com

---

<div align="center">
  <p>Built with ❤️ for the developer community</p>
</div>
