# Asset Strategy

Eventio keeps production-ready brand and social assets in
`apps/web/public/assets`. Vite copies this directory into the deployed site, so
each file is available at `/assets/<filename>`.

## Current Assets

```text
apps/web/public/assets/logo.svg      App/repository logo
apps/web/public/assets/banner.png    README and brand banner
apps/web/public/assets/hero.png      Landing page dashboard preview
apps/web/public/assets/og-image.png  Open Graph and Twitter card image
apps/web/public/favicon.svg          Browser favicon
```

## Usage

- Landing page logo: `/assets/logo.svg`
- Landing page background art: `/assets/banner.png`
- Landing page product preview: `/assets/hero.png`
- Social preview image: `/assets/og-image.png`
- PWA manifest icon: `/assets/logo.svg`

## Maintenance Rules

- Keep asset paths stable unless all references are updated in code, metadata,
  docs, sitemap, and manifest files.
- Optimize large PNG exports before committing when practical.
- Use meaningful alt text for visible images.
- Use empty alt text and `aria-hidden="true"` for decorative images.
- Do not commit exploratory design files, editor caches, or raw working files.
