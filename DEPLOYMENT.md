# Deployment

## Required Services

- PostgreSQL for primary persistence
- Redis for queues and rate-limited background work
- Firebase for optional Google auth/calendar sync
- Supabase for optional auth/data integrations
- PostHog for analytics, if enabled

## Runtime

- Frontend: `apps/web`
- API: `apps/api`
- Workers: `apps/workers`

## Production Notes

- Set `PUBLIC_SITE_URL` and `PUBLIC_API_BASE_URL` to your deployed origins.
- Ensure `DATABASE_URL`, `REDIS_URL`, and auth provider keys are present before boot.
- Use HTTPS and add the production domain to any third-party allowlists.
