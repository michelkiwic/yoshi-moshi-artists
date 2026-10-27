# Notes for Michel and Codex

- Make website changes on `main`; it is the source of truth.
- Never edit `metanet-deploy` manually. GitHub Actions regenerates it after every push to `main`.
- Preserve the Privacy page, the scoped `public/consent.js` integration, and GA4 measurement ID `G-GLZ0H84MBV`.
- Run `npm run build` and `npm run check` before pushing.
- Keep `https://yoshi-moshi.com` as the production canonical URL unless the hosting setup changes.
