import { getPublicConfig } from './publicConfig';

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}

export function getApiBaseUrl() {
  const publicConfig = getPublicConfig();

  const fallback =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : typeof window !== 'undefined'
        ? window.location.origin
        : '';

  return trimTrailingSlash(publicConfig.apiBaseUrl || fallback);
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
