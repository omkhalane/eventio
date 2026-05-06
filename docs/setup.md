# Setup Guide

## Requirements

- Node.js 20+
- npm 10+
- Python 3.11+
- Repository access to `https://github.com/omkhalane/eventio`
- Supabase project for event storage
- Firebase project for Google authentication
- Google Cloud OAuth client for calendar sync

## Web App

```bash
npm install
cp .env.example .env
npm run dev
```

The Vite app lives in `apps/web`, but commands are run from the repo root.

## Scraper Service

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r services/scraper/requirements.txt
python -m services.scraper.main --list
```

Run a single source:

```bash
python -m services.scraper.main --source codeforces --output /tmp/events.json
```

## Environment Variables

Use `.env.example` as the source of truth. Required production variables should
be documented there before they are used in code.

## Verification

```bash
npm run check
npm run build
```
