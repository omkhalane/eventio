import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

function getPublicConfigScript(env: Record<string, string>) {
  const publicConfig = {
    apiBaseUrl:
      env.PUBLIC_API_BASE_URL ||
      (env.NODE_ENV === 'production' ? 'https://event-io.me' : 'http://localhost:3000'),
    siteUrl: env.PUBLIC_SITE_URL,
    firebaseApiKey: env.PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: env.PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: env.PUBLIC_FIREBASE_APP_ID,
    firebaseFirestoreDatabaseId: env.PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID,
    posthogKey: env.PUBLIC_POSTHOG_KEY,
    posthogHost: env.PUBLIC_POSTHOG_HOST,
    environment: env.NODE_ENV || 'development',
  };

  return `window.__EVENTIO_CONFIG__=${JSON.stringify(publicConfig)};`;
}

function publicConfigPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'eventio-public-config',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: {
            src: '/api/config',
          },
          injectTo: 'body-prepend',
        },
      ];
    },
    configureServer(server) {
      server.middlewares.use('/api/config', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(getPublicConfigScript(env));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    root: __dirname,
    plugins: [publicConfigPlugin(env), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // File watching can be disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: false,
    },
  };
});
