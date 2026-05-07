import posthog from 'posthog-js';

import { getPublicConfig } from './publicConfig';

export function initializeObservability() {
  const publicConfig = getPublicConfig();
  const posthogKey = publicConfig.posthogKey;

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: publicConfig.posthogHost || 'https://us.i.posthog.com',
      capture_pageview: true,
    });
  }
}
