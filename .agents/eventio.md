# EventIO Project Documentation

## 🚀 Overview
EventIO is a premium, cinematic event aggregator platform designed for developers and tech enthusiasts. It consolidates contests, hackathons, and conferences from across the web into a high-fidelity, interactive experience.

---

## ✨ Core Features

### 1. Cinematic User Interface
- **Premium Dark Mode**: A deep-black aesthetic (#050505) with subtle glassmorphism and gradient accents.
- **Dynamic Event Cards**: High-fidelity cards that change their theme (colors, patterns, and glows) based on the event category.
- **Cinematic Event Details**: A full-page immersive experience with vertical timelines, metadata strips, and interactive elements.

### 2. Automated Event Intelligence (Scrapers)
The system automatically tracks events from 9+ major platforms:
- **Competitive Programming**: Codeforces, LeetCode, AtCoder, HackerRank, CodeChef.
- **Hackathons & Dev**: Unstop, Devpost, MLH, Devfolio, GeeksforGeeks.
- **Global Reach**: Automatic timezone normalization to UTC.

### 3. Open Graph Image Engine
- **Dynamic Social Previews**: Every event has a programmatically generated OG image at `/api/og/event/[slug]`.
- **Edge Powered**: Uses Vercel Edge Runtime and Satori to generate high-performance images with the EventIO branding.

### 4. Global Discovery
- **Live Search**: Real-time filtering by platform, category, and status.
- **Visual Calendar**: A full-screen interactive calendar view for long-term planning.
- **Social Sharing**: Integrated sharing system for X (Twitter), LinkedIn, Telegram, and Facebook.

---

## 🎨 Design System

### Category Themes (`KIND_THEMES`)
Each event category has a unique visual signature defined in the frontend:

| Category | Tone | Colors | Background Pattern |
| :--- | :--- | :--- | :--- |
| **Contest** | Cyan | `bg-cyan-500/10` | Radial Dot Pattern |
| **Hackathon**| Emerald| `bg-emerald-500/10` | 45-degree Stripes |
| **AI** | Amber | `bg-amber-500/10` | Sparse Dots |
| **CTF** | Rose | `bg-rose-500/10` | Zig-zag lines |
| **Conf** | Violet | `bg-violet-500/10` | Radial Glow |
| **Due** | Orange | `bg-orange-500/10` | Horizontal Grid |

---

## 🏗️ Technical Architecture

### 1. Frontend (`apps/web`)
- **Framework**: React + Vite.
- **Styling**: Tailwind CSS + Framer Motion for cinematic animations.
- **Icons**: Lucide-React.

### 2. API & Serverless (`api/` and `apps/api`)
- **Runtime**: Node.js 24 (ESM).
- **Structure**:
    - `GET /api/v1/events`: Paginated event list with filters.
    - `GET /api/v1/events/:slug`: Detailed single event data.
    - `GET /api/og/event/:slug`: Dynamic OG image generator.
    - `GET /api/v1/stats`: Platform-wide event counts.
    - `POST /api/v1/cron/scrape`: Internal trigger for scraper workers.

### 3. Database Layer (`packages/db`)
- **Engine**: PostgreSQL (Neon).
- **ORM**: Drizzle ORM.
- **Main Tables**:
    - `events`: Normalized event storage with slugs and metadata.
    - `raw_scraped_events`: Raw JSON storage from scrapers.
    - `users`: User profiles and subscription status.

### 4. Shared Infrastructure (`packages/`)
- `@eventio/scraper-core`: Playwright-based scraper implementations.
- `@eventio/queue`: Redis (BullMQ) based job management.
- `@eventio/observability`: Structured logging via Pino.
- `@eventio/config`: Zod-validated environment management.

---

## ⚙️ Logic & Behavior

### The Scraping Pipeline
1. **Trigger**: Vercel Cron hits `/api/v1/cron/scrape`.
2. **Queue**: Jobs are pushed to Redis via `@eventio/queue`.
3. **Execution**: Scraper workers (Playwright) fetch data and save to `raw_scraped_events`.
4. **Normalization**: Raw data is parsed, slugified, and upserted into the `events` table.

### Module System (ESM Migration)
The project utilizes a strict ESM setup to satisfy Node.js 24 requirements:
- All packages have `"type": "module"`.
- Internal imports use explicit `.js` extensions.
- TypeScript is configured with `moduleResolution: "NodeNext"`.

---

## 🛠️ Build & Deployment
- **Platform**: Vercel.
- **Build Command**: `pnpm build` (Recursive build across monorepo).
- **Infrastructure**: Vercel Functions + Neon DB + Upstash Redis.

---

## 📁 Output Directory Structure
- `api/`: Vercel Serverless/Edge functions.
- `apps/api/`: Shared API logic and Fastify server (for local dev).
- `apps/web/`: React frontend.
- `packages/`: Shared internal workspace packages.
- `.agents/`: Agentic documentation and system instructions.
