import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPublicConfigScript() {
  const publicConfig = {
    supabaseUrl: process.env.PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.PUBLIC_SUPABASE_ANON_KEY,
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

  app.use(express.json());

  // API Routes
  const apiRouter = express.Router();
  apiRouter.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      brand: 'Eventio',
      owner: 'Om Khalane',
    });
  });
  app.use('/api/v1', apiRouter);

  app.get('/api/config', (_req, res) => {
    res
      .type('application/javascript')
      .set('Cache-Control', 'no-store')
      .send(getPublicConfigScript());
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
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Eventio by Om Khalane running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
