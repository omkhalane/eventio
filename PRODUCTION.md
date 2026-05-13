# Production Deployment Guide

This guide covers everything needed to deploy Eventio to production, including pre-deployment checklist, infrastructure setup, and deployment instructions.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass: `pnpm test`
- [ ] Linting passes: `pnpm lint`
- [ ] No TypeScript errors: `pnpm build`
- [ ] All dependencies are up-to-date
- [ ] Git history is clean (no secrets in commits)
- [ ] Latest code merged to main branch

### Database
- [ ] Database migrations are tested locally
- [ ] Schema changes are backward compatible
- [ ] Backup strategy is in place
- [ ] Connection pooling is configured
- [ ] Database user has appropriate permissions
- [ ] SSL/TLS is enabled for database connections

### Security
- [ ] All secrets are stored securely (never in .env files)
- [ ] API keys are rotated
- [ ] HTTPS is enforced everywhere
- [ ] CORS is properly configured
- [ ] Rate limiting is appropriate
- [ ] Authentication/authorization is tested
- [ ] Database passwords are strong and unique
- [ ] Redis auth is enabled

### Performance
- [ ] Build size is optimized
- [ ] Database queries are indexed
- [ ] Caching strategies are in place
- [ ] Memory usage is acceptable
- [ ] Load testing has been done
- [ ] CDN configuration is ready

### Documentation
- [ ] README is up-to-date
- [ ] API documentation is current
- [ ] Deployment steps are documented
- [ ] Rollback procedures are documented
- [ ] Monitoring dashboards are set up
- [ ] Alert thresholds are configured

---

## Infrastructure Setup

### Option 1: Railway + Neon + Upstash (Recommended)

#### 1.1 Database (Neon PostgreSQL)

```bash
# Create Neon account at https://console.neon.tech

# Create new project
# - Name: eventio-prod
# - Region: US East (or closest to your users)
# - Copy Pooled Connection String

# Connection String Format:
# postgresql://user:password@host/dbname?sslmode=require
```

**Recommended Settings**:
- Enable autoscaling (compute auto-scaling)
- Set up Point-in-Time Recovery (7+ days)
- Enable daily automated backups
- Configure connection pooling

#### 1.2 Redis (Upstash)

```bash
# Create Upstash account at https://console.upstash.com

# Create Redis database
# - Name: eventio-prod
# - Region: US East (match Neon region)
# - Eviction Policy: noeviction (CRITICAL for BullMQ)

# Copy Redis URL (includes auth):
# redis://:password@host:port
```

**Recommended Settings**:
- Enable TLS
- Set up automatic backups
- Monitor memory usage

#### 1.3 API Server (Railway)

```bash
# Create Railway account at https://railway.app

# Create new project, connect GitHub repo

# Create API service:
# - Name: eventio-api
# - GitHub repo: omkhalane/eventio
# - Build command: pnpm build
# - Start command: pnpm --filter @eventio/api start
# - Port: 3000

# Create Workers service:
# - Name: eventio-workers
# - GitHub repo: omkhalane/eventio
# - Build command: pnpm build
# - Start command: pnpm --filter @eventio/workers start
# - No public port needed
```

#### 1.4 Frontend (Vercel)

```bash
# Create Vercel account at https://vercel.com

# Import project from GitHub

# Configure:
# - Root Directory: apps/web
# - Build Command: pnpm build
# - Output Directory: .output
# - Framework: Other
```

### Option 2: Docker Compose (Self-Hosted)

For complete Docker deployment, update `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: eventio
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      PUBLIC_SITE_URL: ${PUBLIC_SITE_URL}
      PUBLIC_API_BASE_URL: ${PUBLIC_API_BASE_URL}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: pnpm --filter @eventio/api start

  workers:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: pnpm --filter @eventio/workers start

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
```

---

## Environment Configuration

### Production Environment Variables

Create `.env.production` with these variables:

```bash
# Core Settings
NODE_ENV=production
LOG_LEVEL=info

# URLs (Must match your domain)
PUBLIC_SITE_URL=https://event-io.me
PUBLIC_API_BASE_URL=https://event-io.me

# Database (Use pooled connection for production)
DATABASE_URL=postgresql://user:pass@host/eventio?sslmode=require&application_name=eventio

# Redis (Use production instance with auth)
REDIS_URL=redis://:password@host:6379

# API Keys (Generate strong keys)
PUBLIC_API_KEYS=prod_key_abc123,prod_key_xyz789
INTERNAL_API_KEYS=internal_prod_key_secret

# Rate Limiting
PUBLIC_RATE_LIMIT_PER_MINUTE=120
ANONYMOUS_RATE_LIMIT_PER_MINUTE=30

# Optional Integrations
PUBLIC_FIREBASE_API_KEY=${FIREBASE_KEY}
PUBLIC_POSTHOG_KEY=${POSTHOG_KEY}

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
SENTRY_ENVIRONMENT=production

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_ERROR_TRACKING=true
```

### Secrets Management

**NEVER commit `.env` files with real credentials!**

Use your deployment platform's secret management:

- **Railway**: Settings → Variables (Shared Variables for both services)
- **Vercel**: Settings → Environment Variables
- **Neon**: Connection Strings → Manage
- **Upstash**: Security → API Keys

---

## Deployment Steps

### Step 1: Database Preparation

```bash
# Backup production database (if existing)
pg_dump -U postgres production_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
pnpm db:push

# Verify schema
pnpm inspect-db
```

### Step 2: API Deployment

**Railway Option**:
```bash
# Automatic on push to main
# OR manually trigger via Railway dashboard
```

**Docker Option**:
```bash
# Build and push image
docker build -t eventio-api:latest .
docker tag eventio-api:latest registry/eventio-api:latest
docker push registry/eventio-api:latest

# Update and restart
docker-compose up -d api
```

### Step 3: Workers Deployment

```bash
# Same as API, but command is:
pnpm --filter @eventio/workers start

# Verify workers are consuming from queue
docker logs eventio-workers -f
```

### Step 4: Frontend Deployment

**Vercel Option**:
```bash
# Automatic on push to main
# OR manually trigger from Vercel dashboard
```

**Docker/Self-hosted Option**:
```bash
# Build frontend
cd apps/web
pnpm build

# Serve via nginx or static host
```

### Step 5: Initial Scraper Run

```bash
# Trigger all scrapers to populate data
curl -X POST https://your-domain/api/v1/scrape/trigger \
  -H "Authorization: Bearer ${INTERNAL_API_KEY}" \
  -H "Content-Type: application/json"

# Or manually
pnpm scrape:run
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check API health
curl https://event-io.me/healthz

# Check database connection
curl https://event-io.me/api/v1/healthz

# Check stats endpoint
curl https://event-io.me/api/v1/stats
```

### 2. Frontend Verification

- [ ] Visit https://event-io.me
- [ ] Check all pages load
- [ ] Verify SEO tags are correct
- [ ] Check console for errors
- [ ] Test search functionality

### 3. API Verification

- [ ] Test `/api/v1/events` endpoint
- [ ] Test `/api/v1/stats` endpoint
- [ ] Verify rate limiting works
- [ ] Check API response times

### 4. Data Verification

- [ ] Database has events
- [ ] Redis is working
- [ ] Queue is processing
- [ ] Logs are being written

---

## Monitoring & Maintenance

### Monitoring Setup

#### Sentry (Error Tracking)

```javascript
// Configured in api and workers
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  tracesSampleRate: 0.1,
});
```

#### PostHog (Analytics)

```javascript
// Configured in frontend
posthog.init(process.env.PUBLIC_POSTHOG_KEY, {
  api_host: process.env.PUBLIC_POSTHOG_HOST,
});
```

#### Custom Metrics

Monitor these key metrics:

| Metric | Target | Alert |
|--------|--------|-------|
| API Response Time (p95) | <200ms | >500ms |
| Error Rate | <0.1% | >1% |
| Database Connections | <20 | >25 |
| Redis Memory | <500MB | >800MB |
| Queue Depth | <100 | >1000 |
| Scraper Success Rate | >95% | <90% |

### Maintenance Tasks

**Weekly**:
- [ ] Review error logs
- [ ] Check database size
- [ ] Monitor queue depth
- [ ] Verify all scrapers ran

**Monthly**:
- [ ] Review performance metrics
- [ ] Update dependencies
- [ ] Rotate API keys
- [ ] Backup database

**Quarterly**:
- [ ] Security audit
- [ ] Performance optimization
- [ ] Capacity planning
- [ ] Disaster recovery test

---

## Troubleshooting

### Issue: Database Connection Failed

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Verify firewall/security groups allow connection
```

### Issue: Redis Connection Failed

```bash
# Check Redis URL
echo $REDIS_URL

# Test connection
redis-cli -u $REDIS_URL ping

# Verify TLS if required
redis-cli -u $REDIS_URL --tls ping
```

### Issue: Scrapers Not Running

```bash
# Check queue status
redis-cli -u $REDIS_URL
> KEYS bull:scraping*

# Check worker logs
docker logs eventio-workers -f

# Trigger manually
pnpm scrape:trigger codeforces
```

### Issue: High Memory Usage

```bash
# Check Node.js process memory
ps aux | grep node

# Increase heap size
NODE_OPTIONS="--max-old-space-size=4096" pnpm start

# Profile memory usage
node --prof app.js
```

### Issue: Slow API Response

```bash
# Check database query performance
EXPLAIN ANALYZE SELECT * FROM events LIMIT 10;

# Monitor database connections
SELECT count(*) FROM pg_stat_activity;

# Check Redis memory
redis-cli INFO memory
```

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Revert to previous version
git revert HEAD

# 2. Rebuild and redeploy
docker build -t eventio-api:rollback .
docker-compose up -d --pull always api workers

# 3. Restore database if needed
psql production_db < backup_latest.sql

# 4. Verify system is working
curl https://event-io.me/api/v1/healthz
```

---

## Security Best Practices

- [ ] All connections use HTTPS/TLS
- [ ] Database passwords are strong (20+ characters)
- [ ] API keys are rotated regularly
- [ ] Secrets are never logged
- [ ] Database is backed up daily
- [ ] Access logs are monitored
- [ ] Rate limiting is enforced
- [ ] CORS is restrictive
- [ ] Security headers are set
- [ ] Dependencies are up-to-date

---

## Support

For deployment questions or issues:

- Check [DEPLOYMENT.md](DEPLOYMENT.md) for general deployment info
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check logs and error tracking
- Contact: om.khalane.dev@gmail.com
