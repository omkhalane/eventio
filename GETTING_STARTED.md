# Getting Started Guide

Welcome to Eventio! This guide will help you set up the project locally or deploy to production.

## Table of Contents

- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Setup](#docker-setup)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)

---

## Local Development

### Quick Start (5 minutes)

1. **Prerequisites**: Node.js 20+, pnpm, Docker

2. **Clone and install**:

   ```bash
   git clone https://github.com/omkhalane/eventio.git
   cd eventio
   pnpm install
   ```

3. **Start services**:

   ```bash
   docker-compose up -d
   pnpm db:push
   pnpm dev
   ```

4. **Access**:
   - Frontend: http://localhost:5175
   - API: http://localhost:3000
   - Docs: http://localhost:5175/docs

### Step-by-Step Setup

#### 1. Environment Setup

The `.env` file is pre-configured for local development. Review it:

```bash
cat .env
```

Key variables:

- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection
- `PUBLIC_SITE_URL`: Frontend URL (http://localhost:5175)
- `PUBLIC_API_BASE_URL`: API URL (http://localhost:3000)

#### 2. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services
docker-compose ps

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis
```

#### 3. Database Setup

```bash
# Run migrations
pnpm db:push

# Inspect database
pnpm inspect-db

# Generate new migration (if schema changes)
pnpm db:generate
```

#### 4. Start Development Servers

```bash
# Start all services (frontend, API, workers)
pnpm dev

# Or start individual services
pnpm --filter @eventio/web dev    # Frontend only
pnpm --filter @eventio/api start  # API only
pnpm --filter @eventio/workers start  # Workers only
```

#### 5. Populate with Data

```bash
# Trigger scrapers
pnpm scrape:run

# Or trigger specific platforms
pnpm scrape:trigger codeforces
pnpm scrape:trigger leetcode
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart postgres
```

---

## Production Deployment

### Choose Your Platform

#### Option 1: Recommended Stack (Railway + Neon + Upstash)

**Best for**: Cloud-native, serverless, minimal ops

**Components**:

- **Frontend**: Vercel
- **API & Workers**: Railway
- **Database**: Neon PostgreSQL
- **Cache**: Upstash Redis

**Setup Time**: 30 minutes

**Cost**: ~$10-30/month (includes free tier usage)

**Steps**:

1. **Database (Neon)**:

   ```bash
   # Go to https://console.neon.tech
   # Create project → Copy pooled connection string
   # Set DATABASE_URL in Railway
   ```

2. **Cache (Upstash)**:

   ```bash
   # Go to https://console.upstash.com
   # Create Redis database → Copy Redis URL
   # Set REDIS_URL in Railway
   ```

3. **API & Workers (Railway)**:

   ```bash
   # Go to https://railway.app
   # Create project → Connect GitHub
   # Set environment variables
   # API: pnpm --filter @eventio/api start
   # Workers: pnpm --filter @eventio/workers start
   ```

4. **Frontend (Vercel)**:

   ```bash
   # Go to https://vercel.com
   # Import project → Select apps/web as root
   # Deploy automatically on push to main
   ```

5. **Run Initial Scrape**:
   ```bash
   curl -X POST https://your-domain/api/v1/scrape \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

#### Option 2: Docker Compose (Self-Hosted)

**Best for**: Full control, self-hosted, on-premises

**Components**:

- All services in Docker
- PostgreSQL container
- Redis container
- Nginx reverse proxy

**Setup Time**: 1 hour

**Cost**: Server cost only

**Steps**:

1. **Server Requirements**:
   - Linux server (Ubuntu 20.04+)
   - Docker & Docker Compose
   - SSL certificate (Let's Encrypt recommended)
   - 4GB RAM, 20GB SSD minimum

2. **Prepare Server**:

   ```bash
   # SSH into server
   ssh user@your-server

   # Clone project
   git clone https://github.com/omkhalane/eventio.git
   cd eventio

   # Copy environment file
   cp .env.production .env
   # Edit with your values
   nano .env
   ```

3. **Configure SSL**:

   ```bash
   # Install certbot
   sudo apt-get install certbot python3-certbot-nginx

   # Get certificate
   sudo certbot certonly --standalone -d your-domain.com

   # Update nginx config with SSL paths
   ```

4. **Start Services**:

   ```bash
   # Build and start all services
   docker-compose up -d

   # Check status
   docker-compose ps

   # View logs
   docker-compose logs -f
   ```

5. **Monitor**:

   ```bash
   # Check API
   curl https://your-domain/healthz

   # View database
   docker-compose exec postgres psql -U postgres -d eventio

   # Monitor queues
   docker-compose exec redis redis-cli INFO
   ```

### Pre-Deployment Checklist

See [PRODUCTION.md](PRODUCTION.md) for complete checklist including:

- Code quality checks
- Database preparation
- Security configuration
- Performance optimization
- Documentation review

---

## Docker Setup

### Docker Compose Services

```yaml
Services:
  - postgres:16 # PostgreSQL database
  - redis:7 # Redis cache
  - pgbouncer # Connection pooling (optional)
```

### Common Docker Commands

```bash
# Start all services
docker-compose up -d

# View status
docker-compose ps

# View logs (all)
docker-compose logs -f

# View specific service logs
docker-compose logs -f postgres

# Stop services
docker-compose stop

# Remove services (keep volumes)
docker-compose down

# Remove services and volumes
docker-compose down -v

# Restart service
docker-compose restart redis

# Execute command in container
docker-compose exec postgres psql -U postgres

# View resource usage
docker stats
```

### Database Access

```bash
# Via psql (in container)
docker-compose exec postgres psql -U postgres -d eventio

# Via connection string
psql postgresql://postgres:postgres@localhost:5432/eventio
```

### Redis Access

```bash
# Via redis-cli (in container)
docker-compose exec redis redis-cli

# Check memory
docker-compose exec redis redis-cli INFO memory

# Monitor commands
docker-compose exec redis redis-cli MONITOR
```

---

## Common Commands

### Development

```bash
# Start all services
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint codebase
pnpm lint

# Type check
pnpm type-check
```

### Database

```bash
# Apply schema changes
pnpm db:push

# Generate migration
pnpm db:generate

# View database contents
pnpm inspect-db

# Query raw data
node tools/queryRaw.js
```

### Scrapers

```bash
# Trigger specific platform
pnpm scrape:trigger codeforces

# Run all scrapers
pnpm scrape:run

# Supported platforms:
# - codeforces
# - leetcode
# - hackerrank
# - unstop
# - devpost
# - atcoder
# - codechef
# - geeksforgeeks
# - mlh
```

### Inspection

```bash
# Inspect database
pnpm inspect-db

# Query raw data
node tools/queryRaw.js

# View Docker logs
docker-compose logs -f
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are in use
lsof -i :5175  # Frontend
lsof -i :3000  # API
lsof -i :5432  # Database
lsof -i :6379  # Redis

# Kill process on port
lsof -ti :5175 | xargs kill -9
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT version();"

# View logs
docker-compose logs postgres
```

### Redis Connection Failed

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli -u $REDIS_URL ping

# View logs
docker-compose logs redis
```

### High Memory Usage

```bash
# Check processes
ps aux | grep node

# View container stats
docker stats

# Increase Node.js heap
NODE_OPTIONS="--max-old-space-size=4096" pnpm dev
```

### Scrapers Not Running

```bash
# Check queue depth
redis-cli -u $REDIS_URL KEYS bull:scraping*

# View worker logs
docker-compose logs -f workers

# Manually trigger scraper
pnpm scrape:trigger codeforces
```

### API Not Responding

```bash
# Check if service is running
curl http://localhost:3000/healthz

# View API logs
docker-compose logs -f api

# Check database connection
pnpm inspect-db

# Restart API
docker-compose restart api
```

---

## Documentation

- **[README.md](README.md)** - Project overview
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment options
- **[PRODUCTION.md](PRODUCTION.md)** - Production setup
- **[API.md](API.md)** - API documentation

---

## Support

- **Issues**: [GitHub Issues](https://github.com/omkhalane/eventio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/omkhalane/eventio/discussions)
- **Email**: om.khalane.dev@gmail.com

---

## Next Steps

1. ✅ Complete local setup
2. ✅ Run scrapers
3. ✅ Explore API documentation
4. ✅ Check architecture guide
5. ✅ Plan production deployment

**Ready for production?** See [PRODUCTION.md](PRODUCTION.md) for complete deployment guide.
