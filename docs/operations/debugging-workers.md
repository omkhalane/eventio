# Debugging Workers

Due to the asynchronous nature of BullMQ, debugging failing workers requires a systematic approach.

## 1. Locating Failed Jobs

BullMQ moves jobs that exceed their retry limit into a "Failed" state in Redis.

**Local Debugging via BullMQ Dashboard:**
If running locally, you can use a tool like `bull-board` (if configured in development) or Redis CLI to inspect the failed queue.
```bash
# Example Redis CLI check
redis-cli
> KEYS bull:normalization:Failed
```

## 2. Reading Error Logs

Worker logs will output the exact failure reason. Common issues include:
- **Rate Limiting**: "429 Too Many Requests" from a target platform.
  - *Fix*: Increase the backoff multiplier in the queue configuration for that specific scraper.
- **Schema Changes**: "ZodError: Invalid type" during normalization.
  - *Fix*: The target platform changed their payload. Inspect the raw payload in `raw_scraped_events` and update the normalizer schema in `packages/normalization`.
- **Database Timeouts**: Worker cannot write to Neon.
  - *Fix*: Check Neon connection pool limits.

## 3. Replaying Jobs

Because Eventio stores the raw payload in `raw_scraped_events`, you do not need to re-scrape a platform if the normalization logic fails.

1. Fix the parser bug in `packages/normalization`.
2. Find the failed job ID.
3. Manually push the raw payload back into the `normalization` queue.
4. The idempotent pipeline will process the corrected payload, update the dedupe hash, and upsert the canonical event without affecting the original scraped timestamp.

## 4. Poison Pills
If a specific event payload continuously crashes the worker (e.g., OOM due to a massive description), manually delete the job from the queue and flag the `raw_scraped_events` row with `normalization_error = 'OOM Skip'`.
