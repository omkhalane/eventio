/* eslint-disable no-console */
import './env.js';

import { handleApiRequest } from '@eventio/api/src/lib/event-api.js';
import { db, eq,events } from '@eventio/db';
import express, { type Request } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toApiQuery(query: Request['query']) {
  const out: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string' || typeof value === 'undefined') {
      out[key] = value;
    } else if (Array.isArray(value)) {
      out[key] = value.filter((item): item is string => typeof item === 'string');
    } else {
      out[key] = String(value);
    }
  }
  return out;
}

function buildPublicConfig(host: string, port: number, apiHost: string, apiPort: number) {
  const publicConfig = {
    apiBaseUrl:
      process.env.PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://event-io.me'
        : `http://${apiHost}:${apiPort}`),
    siteUrl:
      process.env.PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://event-io.me' : `http://${host}:${port}`),
    firebaseApiKey: process.env.PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.PUBLIC_FIREBASE_APP_ID,
    firebaseFirestoreDatabaseId: process.env.PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID,
    posthogKey: process.env.PUBLIC_POSTHOG_KEY,
    posthogHost: process.env.PUBLIC_POSTHOG_HOST,
    environment: process.env.NODE_ENV || 'development',
  };

  return `window.__EVENTIO_CONFIG__=${JSON.stringify(publicConfig)};`;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 5175);
  const HOST = process.env.HOST || '0.0.0.0';
  const API_PORT = Number(process.env.API_PORT || 3000);
  const API_HOST = process.env.API_HOST || 'localhost';

  app.use(express.json());
  app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // API Routes
  const apiRouter = express.Router();
  apiRouter.use(async (req: express.Request, res: express.Response) => {
    const result = await handleApiRequest(req.method, req.path, toApiQuery(req.query));
    for (const [name, value] of Object.entries(result.headers || {})) {
      res.setHeader(name, value);
    }
    res.status(result.status).json(result.body);
  });
  app.use('/api/v1', apiRouter);

  app.get('/api/config', (_req: express.Request, res: express.Response) => {
    res
      .type('application/javascript')
      .set('Cache-Control', 'no-store')
      .send(buildPublicConfig(HOST === '0.0.0.0' ? 'localhost' : HOST, PORT, API_HOST, API_PORT));
  });

  app.get('/sitemap.xml', async (_req, res) => {
    try {
      const allEvents = await db.select({ slug: events.slug, updatedAt: events.updatedAt }).from(events).where(eq(events.status, 'active'));
      const siteUrl = process.env.PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://event-io.me' : `http://${HOST}:${PORT}`);
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      sitemap += `  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      sitemap += `  <url>\n    <loc>${siteUrl}/events/bookmark</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      for (const event of allEvents) {
        const dateStr = event.updatedAt ? new Date(event.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        sitemap += `  <url>\n    <loc>${siteUrl}/events/${event.slug}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      }
      sitemap += `</urlset>`;
      res.type('application/xml').send(sitemap);
    } catch {
      res.status(500).send('Error generating sitemap');
    }
  });

  app.get('/robots.txt', (_req, res) => {
    const siteUrl = process.env.PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://event-io.me' : `http://${HOST}:${PORT}`);
    res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml`);
  });

  app.get('/events/:slug', async (req, res, next) => {
    const slug = req.params.slug;
    const siteUrl = process.env.PUBLIC_SITE_URL || (process.env.NODE_ENV === 'production' ? 'https://event-io.me' : `http://${HOST}:${PORT}`);
    try {
      const result = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
      const event = result[0];
      if (event) {
        let indexHtmlPath = '';
        let indexHtml = '';
        if (process.env.NODE_ENV !== 'production') {
          indexHtmlPath = path.resolve(__dirname, 'index.html');
          indexHtml = await fs.readFile(indexHtmlPath, 'utf-8');
        } else {
          indexHtmlPath = path.join(process.cwd(), 'dist/apps/web/index.html');
          indexHtml = await fs.readFile(indexHtmlPath, 'utf-8');
        }
        
        const ogTitle = event.title;
        const ogDesc = event.shortDescription || event.description || 'View event details on EventIO';
        const ogImage = event.thumbnailImage || event.bannerImage || `${siteUrl}/assets/logo.svg`;
        
        const metaTags = `
          <meta property="og:title" content="${ogTitle.replace(/"/g, '&quot;')}" />
          <meta property="og:description" content="${ogDesc.replace(/"/g, '&quot;')}" />
          <meta property="og:image" content="${ogImage}" />
          <meta property="og:url" content="${siteUrl}/events/${slug}" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${ogTitle.replace(/"/g, '&quot;')}" />
          <meta name="twitter:description" content="${ogDesc.replace(/"/g, '&quot;')}" />
          <meta name="twitter:image" content="${ogImage}" />
          <title>${ogTitle} | EventIO</title>
        `;
        
        const modifiedHtml = indexHtml.replace('</head>', `${metaTags}\n</head>`);
        res.send(modifiedHtml);
      } else {
        next();
      }
    } catch (e) {
      console.error('SSR Meta Injection Error:', e);
      next();
    }
  });

  // Vite / Static Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, '../../vite.config.ts'),
      root: __dirname,
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist/apps/web');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (_req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
    console.log(`Eventio by Om Khalane running on http://${displayHost}:${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Frontend can use API at http://${API_HOST}:${API_PORT}/api/v1`);
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
