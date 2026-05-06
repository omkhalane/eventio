# Setup Guide

## Requirements

- Node.js 20+
- npm 10+
- Python 3.11+
- Git
- Optional: Supabase project for event data
- Optional: Firebase project for Google authentication
- Optional: Google Cloud OAuth client with Calendar API enabled

## Web App

Run from the repository root:

```bash
npm install
cp .env.example .env
npm run dev
```

The Vite app lives in `apps/web`, but root scripts own development, build, and
typecheck commands.

## Environment Variables

Use `.env.example` as the source of truth.

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

Without these values, the UI can still load, but provider-backed features such
as Supabase event reads, Google sign-in, and Google Calendar sync will not be
fully functional.

## Scraper Service

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r services/scraper/requirements.txt
python3 -m services.scraper.main --list
```

Run a single source:

```bash
python3 -m services.scraper.main --source codeforces --output /tmp/events.json
```

Run all discovered sources and print JSON to stdout:

```bash
python3 -m services.scraper.main
```

## Verification

```bash
npm run typecheck
npm run build
npm run scraper:check
npm run check
```

`npm run check` runs TypeScript checking and Python scraper compilation.
