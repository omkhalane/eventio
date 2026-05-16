# Security Policy

Eventio handles public event data, API access, browser configuration, and deployment secrets. Security reports are welcome and should be handled privately.

## Reporting A Vulnerability

Please do not open a public GitHub issue for security reports.

Use GitHub private vulnerability reporting:

```text
https://github.com/omkhalane/eventio/security/advisories/new
```

If private reporting is unavailable, contact:

```text
om.khalane.dev@gmail.com
```

## What To Include

Please include:

- A clear summary of the issue.
- Steps to reproduce.
- Affected package, app, endpoint, or deployment surface.
- Expected impact.
- Example payloads, screenshots, or logs with secrets removed.
- Whether the issue is already public.

## Scope

In scope:

- Eventio web app code.
- Eventio API code.
- Worker and scraper code.
- Repository configuration and Docker setup.
- Documentation that could lead to unsafe deployment.
- Secret handling and public/private environment variable boundaries.

Out of scope:

- Third-party platforms scraped by Eventio.
- Social engineering.
- Spam or denial-of-service-only reports.
- Reports requiring compromised credentials.
- Vulnerabilities in user-managed infrastructure outside this repository.

## Handling Expectations

The maintainer will review valid reports as soon as practical, ask clarifying questions if needed, and coordinate a fix before public disclosure when appropriate.

## Security Hygiene For Contributors

- Never commit `.env` files with real values.
- Keep server-only secrets out of `PUBLIC_*` variables.
- Remove tokens, cookies, and private user data from logs before sharing.
- Avoid adding debug endpoints that expose config or database state.
- Keep Docker examples development-safe and clearly documented.
