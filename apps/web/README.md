# Eventio Web App

`apps/web` is the public Eventio experience: landing page, calendar, event detail modal, API docs, public metadata, and browser-side integrations.

<p align="center">
  <img src="public/assets/og-image.png" alt="Eventio web preview" width="86%" />
</p>

## Stack

| Layer | Tooling |
| --- | --- |
| UI | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Motion | Motion for React |
| Icons | Lucide React |
| Routing | React Router |
| Analytics | Vercel Analytics, optional PostHog |
| Auth/sync | Firebase config and Google Calendar sync service |

## Source Map

```text
apps/web/
  index.html             HTML shell
  public/                Static assets copied by Vite
  server.ts              Optional Express/Vite server integration
  src/
    App.tsx              Main app routes and calendar state
    components/          Landing, nav, calendar, event modal, docs
    lib/                 API config, Firebase, public config, utils
    services/            Google Calendar sync service
    types.ts             Frontend event and filter types
```

## Commands

From the repository root:

```bash
pnpm --filter @eventio/web run dev
pnpm --filter @eventio/web run build
pnpm --filter @eventio/web run preview
pnpm --filter @eventio/web run lint
```

The root scripts also work:

```bash
pnpm dev
pnpm build
pnpm lint
```

## Public Assets

Keep these deployed paths stable:

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

They are used by the landing page, SEO metadata, Open Graph previews, PWA metadata, and docs.

## Runtime Config

The browser reads public config through environment values and the optional `/api/config` server route.

Important public variables:

```bash
PUBLIC_SITE_URL=http://localhost:5175
PUBLIC_API_BASE_URL=http://localhost:3000
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID=
PUBLIC_POSTHOG_KEY=
PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Only variables prefixed with `PUBLIC_` should be considered browser-readable.

## UI Areas

| Component | Role |
| --- | --- |
| `LandingPage` | Public product page and source/category story. |
| `TopNav` | Global navigation. |
| `MainCalendar` | Primary event browsing surface. |
| `MiniCalendar` | Compact date navigation. |
| `EventModal` | Event details, sharing, bookmark state, Google Calendar sync. |
| `ApiDocs` | In-app API reference. |
| `SeoHead` | Metadata and canonical URL behavior. |

## Frontend Quality Checklist

Before shipping UI changes:

- Run `pnpm --filter @eventio/web run lint`.
- Run `pnpm --filter @eventio/web run build`.
- Check mobile and desktop layouts.
- Confirm images load from `public/assets`.
- Confirm text does not overflow buttons, cards, modals, or navigation.
- Capture screenshots for visible PRs.

## Notes

This app is intentionally visual, but it should stay functional first. The calendar, search, filters, event modal, API docs, and public metadata are product surfaces, not decoration.
