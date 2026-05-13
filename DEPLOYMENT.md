# Deployment Guide

## Architecture

Eventio is deployed as three independent services:

1. **Frontend** (`apps/web`) - React + Vite SPA
2. **API** (`apps/api`) - Fastify REST API
3. **Workers** (`apps/workers`) - Background job processors

## Required Services

### Infrastructure

- **PostgreSQL** v14+: Primary data store (Neon recommended for serverless)
- **Redis**: Queue management and API caching (Upstash recommended)

### Optional Integrations

- **Firebase**: Google auth and calendar integration
- **Supabase**: Database and auth (alternative to Firebase)
- **PostHog**: Analytics and event tracking
- **Sentry**: Error tracking and monitoring

## Environment Setup

### Production Environment Variables

Set these on your deployment platform (Railway, Vercel, etc.):

```bash
# Core
NODE_ENV=production
LOG_LEVEL=info

# URLs
PUBLIC_SITE_URL=https://event-io.me
PUBLIC_API_BASE_URL=https://event-io.me

# Database & Cache
DATABASE_URL=postgresql://user:pass@host/eventio?sslmode=require
REDIS_URL=redis://user:pass@host:6379

# API Keys (set as needed)
PUBLIC_API_KEYS=your_key_here
INTERNAL_API_KEYS=internal_key_here

# Optional
PUBLIC_FIREBASE_API_KEY=...
PUBLIC_POSTHOG_KEY=...
```

## Deployment Platforms

### Option 1: Railway + Neon + Upstash (Recommended)

**Frontend (Vercel)**:

1. Connect GitHub repo to Vercel
2. Set root directory: `apps/web`
3. Build command: `pnpm build`
4. Environment variables: Copy from `.env.example`

**API & Workers (Railway)**:

1. Create Railway project
2. Connect GitHub repo
3. Create two services:
   - API: Start command `pnpm --filter @eventio/api start`
   - Workers: Start command `pnpm --filter @eventio/workers start`
4. Add environment variables to Railway Shared Variables
5. Add PostgreSQL (Neon) and Redis (Upstash) connections

**Database (Neon)**:

1. Create Neon project
2. Copy pooled connection string to `DATABASE_URL`
3. Run migrations from Railway

**Queue (Upstash)**:

1. Create Upstash Redis instance
2. Copy connection URL to `REDIS_URL`

### Option 2: Docker Compose (Self-Hosted)

See `docker-compose.yml` for full stack deployment.

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Pre-Deployment Checklist

- [ ] Database migrations are up to date
- [ ] Redis is accessible and working
- [ ] Environment variables are set correctly
- [ ] HTTPS is enabled for all services
- [ ] CORS is configured (API and frontend origins)
- [ ] API keys are generated and stored securely
- [ ] Database backups are configured
- [ ] Monitoring/logging is set up
- [ ] Error tracking is configured
- [ ] Rate limiting is appropriate for load

## Post-Deployment

1. **Verify API Health**:

   ```bash
   curl https://your-domain/api/v1/healthz
   ```

2. **Check Frontend**:
   - Visit https://your-domain
   - Check `/docs` for API documentation

3. **Monitor Logs**:
   - Track error rates in Sentry
   - Monitor performance in PostHog
   - Check database slow queries

4. **Run Scrapers**:
   - Trigger initial scrape: `pnpm scrape:run`
   - Monitor queue depth in Redis

## Scaling

- **API**: Horizontally scalable (stateless)
- **Workers**: Increase concurrency or replicas for faster ingestion
- **Database**: Use Neon autoscaling or upgrade compute
- **Redis**: Monitor memory usage; upgrade if needed

## Additional Resources

For comprehensive production setup including pre-deployment checklist, monitoring, and troubleshooting, see [PRODUCTION.md](PRODUCTION.md).
