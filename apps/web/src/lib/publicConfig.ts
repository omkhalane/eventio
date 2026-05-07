export type PublicConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
  firebaseFirestoreDatabaseId?: string;
  posthogKey?: string;
  posthogHost?: string;
  environment?: string;
};

declare global {
  interface Window {
    __EVENTIO_CONFIG__?: PublicConfig;
  }
}

export function getPublicConfig(): PublicConfig {
  if (typeof window === 'undefined') {
    return {};
  }

  return window.__EVENTIO_CONFIG__ ?? {};
}
