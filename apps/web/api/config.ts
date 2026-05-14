import type { VercelRequest, VercelResponse } from '@vercel/node';

function buildPublicConfig() {
  const publicConfig = {
    apiBaseUrl: process.env.PUBLIC_API_BASE_URL || 'https://event-io.me',
    siteUrl: process.env.PUBLIC_SITE_URL || 'https://event-io.me',
    firebaseApiKey: process.env.PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.PUBLIC_FIREBASE_APP_ID,
    firebaseFirestoreDatabaseId: process.env.PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID,
    posthogKey: process.env.PUBLIC_POSTHOG_KEY,
    posthogHost: process.env.PUBLIC_POSTHOG_HOST,
    environment: process.env.NODE_ENV || 'production',
  };

  return `window.__EVENTIO_CONFIG__=${JSON.stringify(publicConfig)};`;
}

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res
    .setHeader('Content-Type', 'application/javascript; charset=utf-8')
    .setHeader('Cache-Control', 'no-store')
    .status(200)
    .send(buildPublicConfig());
}
