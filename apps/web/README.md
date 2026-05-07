# Eventio Web App

React + Vite frontend for browsing, filtering, and syncing developer events.

## Source

```text
apps/web/index.html       HTML shell, SEO tags, JSON-LD, manifest link
apps/web/public/          Static public assets copied into the Vite build
apps/web/src/App.tsx      Routes and calendar app state
apps/web/src/components/  Landing page, calendar, modal, nav, and UI pieces
apps/web/src/lib/         Firebase, Supabase, and utility setup
apps/web/src/services/    Browser-side Google Calendar sync service
```

## Commands

Run from the repository root:

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
```

The root `vite.config.ts` sets `apps/web` as the Vite root and emits production
files to `dist/apps/web`. Local dev usually starts at
`http://127.0.0.1:5173/`; if the port is busy, use the URL Vite prints.

## Public Assets

The app uses these deployed paths:

```text
/assets/logo.svg
/assets/banner.png
/assets/hero.png
/assets/og-image.png
/favicon.svg
/manifest.json
/robots.txt
/sitemap.xml
```

Keep these paths stable because they are referenced by the landing page, social
metadata, PWA manifest, and docs.
