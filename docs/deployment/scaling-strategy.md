# Scaling Strategy

Eventio is designed to scale horizontally across its various decoupled layers.

## 1. Worker Scaling (Ingestion & Processing)
The heaviest load occurs during bulk scraping.
- **Problem**: Processing thousands of events sequentially takes too long.
- **Solution**: BullMQ handles queue concurrency. On Railway, we can increase the replica count of the `workers` service. Since BullMQ is atomic, multiple worker replicas will safely pull jobs from the shared Redis instance without duplication.

## 2. Database Scaling (Neon)
- **Problem**: High write concurrency from workers or sudden read spikes from API.
- **Solution**: 
  - Neon natively supports Autoscaling. We configure compute limits to burst during intensive ingestion crons.
  - Using PgBouncer/Neon Pooler prevents connection exhaustion from horizontally scaled workers.

## 3. API Scaling (Railway/Fastify)
- **Problem**: High user traffic requesting event data.
- **Solution**:
  - The API service is stateless. Increase Railway replicas to load balance incoming traffic.
  - Implement Redis caching for common queries (e.g., "upcoming events this week").

## 4. Search Scaling
- **Problem**: Complex text filtering scanning millions of rows.
- **Solution**: Shift from PostgreSQL Full-Text Search to a dedicated distributed search engine (Typesense or Algolia) as outlined in the search architecture.

## Bottleneck Identification
Monitor Redis memory limits and Postgres active connections. These are the most common choke points before CPU/RAM constraints hit the Node.js services.
