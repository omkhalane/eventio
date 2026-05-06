# Vercel Deployment

Eventio deploys to Vercel as a static Vite app from the repository root. The
frontend source lives in `apps/web`, and the production build is emitted to
`dist/apps/web`.

## Project Settings

Use these values in the Vercel dashboard if Vercel does not auto-detect them:

```text
Framework Preset: Vite
Root Directory: ./
Install Command: npm ci
Build Command: npm run build
Output Directory: dist/apps/web
Development Command: npm run dev
Node.js Version: 20.x
```

The same settings are committed in `vercel.json`, so importing the repository
should work without extra build configuration.

## Environment Variables

Add these variables in Vercel under Project Settings -> Environment Variables.
Use the same values for Production, Preview, and Development unless you keep
separate Firebase or Supabase projects per environment.

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

In Firebase Authentication, add your Vercel domains to the authorized domains
list:

```text
your-project.vercel.app
your-custom-domain.com
```

If you use preview deployments for auth testing, also add the relevant preview
domain shown by Vercel.

## Google OAuth Setup

In Google Cloud Console, configure the OAuth web client for the deployed app:

```text
Authorized JavaScript origins:
https://your-project.vercel.app
https://your-custom-domain.com
```

The app uses the browser Google API flow for Calendar access, so the deployed
origin must match exactly.

## Supabase Setup

In Supabase, add the deployed URLs to Auth URL configuration if you use Supabase
Auth redirects in the future:

```text
Site URL: https://your-custom-domain.com
Additional Redirect URLs:
https://your-project.vercel.app/**
https://your-custom-domain.com/**
```

The current app uses Supabase for data storage from the browser, so verify Row
Level Security policies allow only the intended public reads and user writes.

## CLI Deployment

Install or run the Vercel CLI, link the project, then deploy:

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
https://your-domain.com/
https://your-domain.com/calendar
https://your-domain.com/api/v1/health
https://your-domain.com/robots.txt
https://your-domain.com/sitemap.xml
```

The `/api/v1/health` endpoint is a Vercel serverless function. All other app
routes are served by the Vite SPA rewrite to `index.html`.
