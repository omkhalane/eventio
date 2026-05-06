# Vercel Deployment

Eventio deploys to Vercel as a static Vite app from the repository root. The
frontend source lives in `apps/web`, and the production build is emitted to
`dist/apps/web`.

## Project Settings

These values are committed in `vercel.json`:

```text
Framework Preset: Vite
Root Directory: ./
Install Command: npm ci
Build Command: npm run build
Output Directory: dist/apps/web
Development Command: npm run dev
Node.js Version: 20.x
```

The config also defines long-lived cache headers for static assets and a SPA
rewrite so routes such as `/calendar` and `/architecture` load correctly.

## Environment Variables

Add these variables in Vercel under Project Settings -> Environment Variables.
Use separate values per environment if you keep separate Firebase or Supabase
projects for Production, Preview, and Development.

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_FIRESTORE_DATABASE_ID=
VITE_GOOGLE_CLIENT_ID=
```

Do not add `NODE_ENV`; Vercel sets it during builds and runtime.

## Firebase Setup

In Firebase Authentication, add each deployed host to the authorized domains
list:

```text
eventio-sandy.vercel.app
your-custom-domain.com
```

If you test authentication on preview deployments, add the preview domain shown
by Vercel or use a dedicated Firebase preview project.

## Google OAuth Setup

In Google Cloud Console, configure the OAuth web client:

```text
Authorized JavaScript origins:
https://eventio-sandy.vercel.app
https://your-custom-domain.com
```

Enable the Google Calendar API for the same project. The browser sync flow calls
`https://www.googleapis.com/calendar/v3/calendars/primary/events` with the
signed-in user's access token.

## Supabase Setup

The frontend reads from Supabase using `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY`. Confirm Row Level Security policies allow only the
intended public reads and authenticated user writes.

If Supabase Auth redirects are added later, configure:

```text
Site URL: https://eventio-sandy.vercel.app
Additional Redirect URLs:
https://eventio-sandy.vercel.app/**
https://your-custom-domain.com/**
```

## CLI Deployment

```bash
npx vercel link
npx vercel env pull .env.local
npm run build
npx vercel deploy
npx vercel deploy --prod
```

For dashboard-based deployment, import the GitHub repository into Vercel and
push to the production branch.

## Verification

After deployment, check:

```text
https://eventio-sandy.vercel.app/
https://eventio-sandy.vercel.app/calendar
https://eventio-sandy.vercel.app/architecture
https://eventio-sandy.vercel.app/api/v1/health
https://eventio-sandy.vercel.app/assets/hero.png
https://eventio-sandy.vercel.app/assets/og-image.png
https://eventio-sandy.vercel.app/robots.txt
https://eventio-sandy.vercel.app/sitemap.xml
```

`/api/v1/health` is a Vercel serverless function. All app routes are served by
the Vite SPA rewrite to `index.html`.
