import { getPublicConfig } from '../lib/publicConfig';
import { useEffect } from 'react';

type SeoHeadProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  noIndex?: boolean;
};

const DEFAULT_BASE = 'https://event-io.me';

function setMetaTag(selector: string, attribute: 'name' | 'property', value: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${selector}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, selector);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', value);
  return tag;
}

export function SeoHead({
  title,
  description,
  canonicalPath = '/',
  image = '/assets/og-image.png',
  noIndex = false,
}: SeoHeadProps) {
  useEffect(() => {
    const publicConfig = getPublicConfig();
    const base = publicConfig.siteUrl || DEFAULT_BASE;
    const canonicalUrl = `${base}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

    document.title = title;

    setMetaTag('description', 'name', description);
    setMetaTag('title', 'name', title);
    setMetaTag('og:title', 'property', title);
    setMetaTag('og:description', 'property', description);
    setMetaTag('og:url', 'property', canonicalUrl);
    setMetaTag('og:image', 'property', `${base}${image}`);
    setMetaTag('twitter:title', 'property', title);
    setMetaTag('twitter:description', 'property', description);
    setMetaTag('twitter:image', 'property', `${base}${image}`);

    const robots = setMetaTag(
      'robots',
      'name',
      noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    );

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    return () => {
      robots.setAttribute('content', 'index, follow');
    };
  }, [canonicalPath, description, image, noIndex, title]);

  return null;
}
