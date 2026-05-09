# Search Architecture

To provide an instant, sub-50ms search experience on the frontend, Eventio decouples the write-heavy ingestion pipeline from the read-heavy search interface.

## 1. Initial Implementation: PostgreSQL Full-Text Search (FTS)
Before adopting dedicated search engines, we use PostgreSQL's built-in capabilities to limit infrastructure complexity while maintaining speed.

- **Read Model Table**: `event_search_documents`
  - A denormalized table aggregating tags, platform names, and event details.
- **Indexing**: Uses `GIN` indexes on a `tsvector` column combining title, description, and tags.
- **Workflow**: 
  - Canonical event update -> triggers `indexing` BullMQ job -> Upserts into `event_search_documents`.

## 2. Abstraction Layer: Ready for Typesense
The application code accesses search exclusively through a generic interface (e.g., `SearchService.query()`). This abstraction means the frontend API requires zero changes when migrating the backend engine.

- **Phase 2 (Typesense/Algolia)**: Once the dataset exceeds PostgreSQL's FTS comfortable in-memory limits, the `indexing` queue will push documents directly to a standalone Typesense cluster.
