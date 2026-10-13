# Deployment Architecture

## Text Diagram

```text
[Users / Browsers]
       |
       v
[CDN Edge + Firebase Hosting]
  - Angular static browser bundle
  - prerendered routes
       |
       | HTTPS API calls
       v
[Render Web Service: Strapi or Payload CMS]
  - REST/GraphQL API
  - auth / admin panel
       |
       v
[Managed Postgres]
  - content models
  - users / roles

[Object Storage + CDN]
  - media uploads
  - transformed image variants
```

## Recommended topology
- Frontend domain: `https://studio.example.com` on Firebase Hosting.
- CMS/API domain: `https://cms.example.com` on Render.
- Database: Render Managed Postgres or external managed Postgres.
- Media: S3-compatible bucket + CDN front domain `https://media.example.com`.

## Why this split
- Frontend deploys are fast and independent.
- CMS can scale separately (CPU/memory/db connections).
- Media delivery is optimized by CDN and kept off app servers.
