# Production Deployment

Eventio uses a multi-platform deployment strategy to optimize for cost, performance, and developer experience.

## Deployment Architecture

1. **Frontend (`apps/web`)**: Hosted on Vercel.
2. **API (`apps/api`)**: Hosted on Railway (or Fly.io).
3. **Workers (`apps/workers`)**: Hosted on Railway (or Fly.io).
4. **Database**: Neon (PostgreSQL).
5. **Cache/Queue**: Railway Redis.

## Deployment Steps

### 1. Database (Neon)
Migrations are run via GitHub Actions on push to `main`:
```yaml
# .github/workflows/migrate.yml
- name: Run Migrations
  run: pnpm --filter db run db:migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### 2. Backend (Railway)
The API and Worker services are connected to the GitHub repository via Railway's CI/CD.
- Any commit to `main` triggers a rebuild.
- Environment variables are securely managed in Railway Shared Variables.
- Railway internally networks the API, Workers, and Redis instance.

### 3. Frontend (Vercel)
Vercel is connected to the GitHub repository.
- Root Directory: `apps/web`
- Build Command: `pnpm build`
- Environment Variables:
  - `VITE_API_URL`: Points to the Railway API public URL.

## Pre-flight Checklist
- [ ] Database migrations are up to date.
- [ ] Redis instance is provisioned and responsive.
- [ ] Neon connection strings are set in Railway.
- [ ] Vercel has the correct public API URL.
- [ ] API CORS settings explicitly allow the Vercel production domain.
