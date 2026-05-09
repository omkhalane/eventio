# Neon PostgreSQL Setup

Eventio uses Neon for serverless PostgreSQL. This ensures our database scales to zero during low ingestion periods but handles high-concurrency connections efficiently.

## 1. Create a Neon Project
1. Go to [Neon.tech](https://neon.tech/) and create an account.
2. Create a new project named `eventio-production`.
3. Select the region closest to your Vercel/Railway deployments (e.g., `us-east-1`).

## 2. Retrieve Connection String
1. In the Neon dashboard, go to the **Dashboard** -> **Connection Details**.
2. Make sure you copy the **Pooled connection** string (this usually includes `?pgbouncer=true` or similar pooler parameters depending on the driver).
   - *Note: Since we use Drizzle, check Drizzle's Neon HTTP driver docs or ensure standard Postgres pooler is used for Fastify.*

## 3. Environment Configuration
Add the connection string to your deployment environments (Vercel, Railway) and local `.env`:
```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
```

## 4. Run Migrations
Deploy the database schema using Drizzle from your local machine or CI/CD pipeline:
```bash
pnpm --filter db run db:migrate
```

## Recommended Production Settings
- Enable **Autoscaling** to handle sudden bursts when all scrapers trigger simultaneously.
- Set up **Point-in-Time Recovery (PITR)** in Neon settings to at least 7 days to protect raw ingestion data.
