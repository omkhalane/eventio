# SEO and Discoverability

## Current Web Metadata

The Vite HTML shell at `apps/web/index.html` includes:

- title and description
- canonical URL
- Open Graph metadata
- Twitter card metadata
- JSON-LD for `SoftwareApplication`
- JSON-LD for `WebSite`
- favicon
- web app manifest

Public SEO files live in `apps/web/public`:

```text
favicon.svg
manifest.json
robots.txt
sitemap.xml
assets/og-image.png
```

## Configured Production URL

The current metadata and sitemap use:

```text
https://eventio-sandy.vercel.app/
```

If the project moves to a custom domain, update these files together:

- `apps/web/index.html`
- `apps/web/public/robots.txt`
- `apps/web/public/sitemap.xml`
- `docs/vercel.md`

## Repository SEO

Recommended repository description:

```text
Open-source developer event aggregator for coding contests, hackathons,
AI competitions, tech conferences, and hiring challenges.
```

Recommended topics:

```text
developer-events, hackathons, coding-contests, competitive-programming,
calendar, ai-competitions, tech-events, react, typescript, python, scraper
```

## Future Dynamic Routes

The current app is a client-rendered SPA. Future SEO-focused pages could add
semantic routes such as:

- `/hackathons`
- `/coding-contests`
- `/ai-competitions`
- `/tech-conferences`
- `/events/:platform`

Those pages should be backed by stable content and route-specific metadata
before being added to the sitemap.
