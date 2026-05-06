# CALENDAR 🗓️

**The Universal Tech Event Aggregator for Developers.**

CALENDAR is a modern, high-performance calendar web application designed specifically for the developer community. It aggregates competitive programming contests, global hackathons, tech conferences, and hiring challenges into one unified, lightning-fast dashboard.

![CALENDAR Preview](https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=2000)

## ✨ Unique Value Propositions

- **The Index of Elite Events**: We track 50+ platforms including Codeforces, LeetCode, Devpost, MLH, and many more.
- **Developer-First UX**: Keyboard-first navigation inspired by Linear and Raycast.
- **Zero Latency Discovery**: Optimized React architecture for a buttery-smooth 120fps experience.
- **Deep Syncing**: One-click synchronization with your Google Calendar for seamless schedule management.

## 🚀 Optimized Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build System**: [Vite 6](https://vitejs.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend Architecture**: [Supabase](https://supabase.com/) & [Firebase Auth](https://firebase.google.com/)
- **Database**: Real-time event indexing from the CALENDAR Scraper Service.

## 🛠️ Infrastructure & Setup

### Prerequisites

- Node.js 20+
- A Google Cloud Project (for Google Calendar API)
- Firebase Project (for Authentication)
- Supabase Instance (for Event Storage)

### Local Development

1. **Clone & Install**:
   ```bash
   git clone https://github.com/algorithmicOS/calendar.git
   cd calendar
   npm install
   ```

2. **Secrets Management**:
   Configure your environment variables in `.env` (see `.env.example`).
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_SUPABASE_URL=...
   ```

3. **Runtime**:
   ```bash
   npm run dev
   ```

## ⌨️ Developer Shortcuts

| Shortcut | Action |
| :-- | :-- |
| `Ctrl + K` | Global Search / Command Palette |
| `D` | Snap to Today |
| `A` / `F` | Navigate Month Prev / Next |
| `M` / `L` | Toggle Month / List View |
| `Esc` | Clear UI Overlays |

## 🛡️ Security & Privacy

CALENDAR is built with a **Security-First** philosophy:
- **Client-Side Encryption**: Authorization tokens never leave your local environment.
- **Strict SEO**: Optimized with proper `robots.txt` and `sitemap.xml` for indexed visibility.
- **Private by Design**: Your calendar data is only fetched and synced upon explicit user permission.

## 📄 License

MIT © [Algorithmic OS](https://github.com/algorithmicOS)
# eventio
