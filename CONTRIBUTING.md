# Contributing

Thanks for helping make Eventio sharper. The project values practical changes, clean reasoning, and a repo that stays easy to run after each contribution.

## Best First Contributions

- Fix a UI bug in `apps/web`.
- Improve accessibility, keyboard behavior, or responsive layout.
- Add a scraper source in `packages/scraper-core`.
- Improve event normalization, dedupe, or API validation.
- Strengthen docs, Docker setup, tests, or developer tooling.
- Add focused tests for utility code or API behavior.

## Local Setup

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:push
pnpm dev
```

Useful URLs:

- Web app: `http://localhost:5175` or the Vite URL printed in the terminal.
- API health: `http://localhost:3000/healthz`.
- In-app docs: `/docs`.

## Quality Checks

Run these before opening a PR:

```bash
pnpm lint
pnpm build
```

Run focused checks when relevant:

```bash
pnpm --filter @eventio/web run build
pnpm --filter @eventio/workers run scrape:run
pnpm --filter @eventio/db run db:generate
```

## Branches And Commits

Use small branches with clear intent:

```text
fix/web-event-modal-share-buttons
docs/docker-local-stack
feat/scraper-new-source
```

Use Conventional Commit style:

```text
fix(web): handle empty event dates
docs: refresh local setup guide
feat(scraper): add source adapter
chore(docker): clean compose profiles
```

## Pull Request Standard

A strong PR includes:

- What changed.
- Why it changed.
- How it was tested.
- Screenshots for visible UI updates.
- Example payloads or source notes for scraper/API changes.
- Migration notes for database changes.
- Documentation updates when setup, behavior, schema, or architecture changes.

## Adding Or Updating A Scraper

Scraper code belongs in `packages/scraper-core/src`.

Guidelines:

- Prefer stable APIs, JSON-LD, RSS, or static HTML before browser automation.
- Keep source-specific quirks inside the scraper module.
- Normalize dates, URLs, platform names, and event types as close to ingestion as possible.
- Avoid committing local scraper JSON output.
- Capture a small note in the PR explaining how the source behaves and what can break.

Run:

```bash
pnpm scrape:run
```

Local debug exports may appear in `apps/workers/scraper-output/`; that folder is ignored.

## Frontend Guidelines

- Keep the first screen useful, not just decorative.
- Preserve existing design language and responsive behavior.
- Use existing assets from `apps/web/public/assets` when possible.
- Keep text readable on mobile and desktop.
- Use stable dimensions for buttons, panels, calendars, and repeated cards.
- Run `pnpm --filter @eventio/web run build` for TypeScript and Vite validation.

## API Guidelines

- Keep route behavior centralized in `apps/api/lib/event-api.ts` when possible.
- Validate and document query inputs.
- Preserve security headers and auth hooks.
- Avoid leaking secrets or internal error details to public responses.

## Database Guidelines

- Keep schema changes in `packages/db`.
- Generate migrations when the schema changes.
- Mention migration impact in the PR.
- Avoid destructive migration behavior unless it is clearly intentional and documented.

## Repo Hygiene

Do not commit:

- `.env` or real credentials.
- `node_modules/`.
- `dist/` or app build outputs.
- local logs.
- scraper output JSON.
- temporary scripts or one-off debug files.

## Security

Do not open a public issue for vulnerabilities. Use [SECURITY.md](SECURITY.md).
