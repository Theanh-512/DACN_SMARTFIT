# Render CMS Setup (Strapi or Payload)

## 1. Create services
- Create a Web Service for CMS app.
- Create Managed Postgres instance.
- Attach Postgres connection env vars to Web Service.

## 2. Build/start commands
- Strapi example:
  - Build: `npm ci && npm run build`
  - Start: `npm run start`
- Payload example:
  - Build: `npm ci && npm run build`
  - Start: `npm run start`

## 3. Persistent storage and media
- Do not rely on Render ephemeral disk for production media.
- Use object storage (S3/R2/GCS compatible) via CMS upload plugin/adapter.
- Serve media via CDN domain (e.g. `media.example.com`).

## 4. Health and scaling
- Configure health endpoint (for example `/health`).
- Set minimum instances and autoscaling policy based on traffic.
- Tune connection pool for managed Postgres.

## 5. CORS and allowed origins
- Allow frontend domains only:
  - `https://studio.example.com`
  - `https://staging.studio.example.com`
- Allow required headers/methods and credentials policy as needed.

## 6. Deploy pipeline
- Use separate Render service (or environment) for staging and production.
- Promote schema/content changes via migration/export/import workflows.
