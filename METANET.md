# Metanet deployment

`main` is the source branch. Every push to `main` builds and verifies the website, then updates the generated `metanet-deploy` branch. Do not edit `metanet-deploy` by hand.

Plesk must track `metanet-deploy` with automatic deployment into the document root assigned to `yoshi-moshi.com`. Add Plesk's repository-specific webhook URL under **GitHub → Settings → Webhooks**, using `application/json` and push events. No npm command is required on Metanet.

The production build uses `https://yoshi-moshi.com` for canonical URLs and includes the Privacy page, the analytics settings control, and GA4 measurement ID `G-GLZ0H84MBV`.
