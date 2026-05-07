type ConfigResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    send: (body: string) => void;
  };
};

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
    environment: process.env.NODE_ENV || 'production',
  };

  return `window.__EVENTIO_CONFIG__=${JSON.stringify(publicConfig)};`;
}

export default function handler(_request: unknown, response: ConfigResponse) {
  response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.status(200).send(getPublicConfigScript());
}
