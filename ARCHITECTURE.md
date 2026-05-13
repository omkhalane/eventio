# Architecture

Eventio uses a modular monorepo with three runtime surfaces:

- `apps/web` — React/Vite frontend and SEO pages
- `apps/api` — Fastify API for event stats and search
- `apps/workers` — ingestion and scrapers

The ingestion path is:

Scrapers -> normalization -> dedupe -> database -> API -> frontend

The platform is designed so the frontend can run independently from the API base URL via env-driven configuration.
