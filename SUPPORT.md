# Support

Eventio is an open-source project maintained by Om Khalane.

## Where To Ask

| Need | Best Place |
| --- | --- |
| Bug report | GitHub issue with reproduction steps |
| Feature idea | GitHub issue describing the user need |
| New scraper source | Issue or PR with source details |
| Setup help | GitHub discussion or issue |
| Security issue | Follow [SECURITY.md](SECURITY.md) |

## Before Opening An Issue

Please include:

- What you expected to happen.
- What actually happened.
- Your OS, Node.js version, pnpm version, and Docker version if relevant.
- The command you ran.
- Relevant logs with secrets removed.
- Screenshots for UI issues.
- Sample URLs or payloads for scraper/API issues.

## Useful Local Checks

```bash
pnpm lint
pnpm build
docker compose ps
docker compose logs -f
```

## Privacy

Do not paste API keys, database URLs, cookies, access tokens, private emails, or production logs containing user data.
