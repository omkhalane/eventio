# Railway Setup

Railway is the primary hosting platform for Eventio's API and Worker services.

## 1. Initial Setup
1. Create an account on [Railway.app](https://railway.app/).
2. Create a new Project.
3. Link your GitHub repository.

## 2. Deploying Services

### Deploying the API
1. Create a new service from the GitHub repo.
2. Set the Root Directory (if needed) or use a custom start command for the monorepo.
3. **Build Command**: `pnpm build`
4. **Start Command**: `pnpm --filter api start`
5. Expose the service to the public internet by generating a domain in Railway.

### Deploying the Workers
1. Create *another* service from the same GitHub repo in the same Railway project.
2. **Build Command**: `pnpm build`
3. **Start Command**: `pnpm --filter workers start`
4. This service does **not** need a public domain, as it only consumes from the Redis queue.

### Scheduler / Cron Jobs
1. Railway supports Cron Jobs.
2. Configure a scheduled job to trigger the scrapers by sending a request to the Worker service or by running a script:
   - Command: `pnpm --filter workers run cron:trigger-all`
   - Schedule: `*/15 * * * *` (Every 15 minutes)

## 3. Environment Variables
Add these to the **Shared Variables** in Railway so both API and Workers inherit them:
- `DATABASE_URL` (From Neon)
- `REDIS_URL` (From Railway Redis)
- `NODE_ENV=production`
