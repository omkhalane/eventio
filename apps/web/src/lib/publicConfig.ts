export type PublicConfig = {
  apiBaseUrl?: string;
  siteUrl?: string;
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

  const cfg = { ...(window.__EVENTIO_CONFIG__ ?? {}) };

  const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1';

  if (!cfg.apiBaseUrl) {
    if (isLocalHost) {
      cfg.apiBaseUrl = 'http://localhost:3000';
    } else {
      cfg.apiBaseUrl = window.location.origin;
    }
  }

  if (!cfg.siteUrl) {
    cfg.siteUrl = window.location.origin;
  }

  return cfg;
}
