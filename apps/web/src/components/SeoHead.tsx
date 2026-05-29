import React from 'react';
import { Helmet } from 'react-helmet-async';

import { getPublicConfig } from '../lib/publicConfig';

type SeoHeadProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  noIndex?: boolean;
};

const DEFAULT_BASE = 'https://event-io.me';

export function SeoHead({
  title,
  description,
  canonicalPath = '/',
  image = '/assets/og-image.png',
  noIndex = false,
}: SeoHeadProps) {
  const publicConfig = getPublicConfig();
  const base = publicConfig.siteUrl || DEFAULT_BASE;
  const canonicalUrl = `${base}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  const fullImage = image.startsWith('http') ? image : `${base}${image}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="title" content={title} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Indexing */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
