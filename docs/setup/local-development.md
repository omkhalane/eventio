# Local Development Setup

Follow these exact steps to run Eventio locally.

## Prerequisites
- **Node.js**: v20+
- **pnpm**: v8+ (`npm install -g pnpm`)
- **Docker**: For running local Postgres and Redis.

## 1. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Ensure the following are set in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventio"
REDIS_URL="redis://localhost:6379"
```

## 2. Start Infrastructure
Start the local Postgres and Redis instances using Docker Compose:
```bash
docker-compose up -d
```

## 3. Install Dependencies
```bash
pnpm install
```

## 4. Database Migrations
Push the Drizzle schema to the local database:
```bash
pnpm --filter db run db:push
# or if using migrations:
pnpm --filter db run db:migrate
```

## 5. Start Development Servers
Run the whole monorepo concurrently:
```bash
pnpm run dev
```
This command starts:
- Frontend (`apps/web`) on `http://localhost:5173`
- API (`apps/api`) on `http://localhost:3000`
- Worker processors (`apps/workers`) in the background.

## Running Scrapers Manually
To trigger a specific scraper locally:
```bash
pnpm --filter workers run scrape:trigger codeforces
```
