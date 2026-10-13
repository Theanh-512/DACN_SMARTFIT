# Required Environment Variables

## Angular frontend build-time config
- `CMS_PROVIDER` (strapi | payload)
- `CMS_API_BASE_URL` (e.g. `https://cms.example.com/api`)
- `CMS_GRAPHQL_URL` (if GraphQL is used)
- `USE_MOCK_CONTENT` (`false` in staging/prod)
- `APP_BASE_URL` (e.g. `https://studio.example.com`)

## CMS backend runtime (Strapi/Payload + Render)
- `NODE_ENV=production`
- `PORT`
- `DATABASE_URL` (managed Postgres connection string)
- `APP_KEYS` / `JWT_SECRET` / `ADMIN_JWT_SECRET` (Strapi)
- `PAYLOAD_SECRET` (Payload)
- `CORS_ORIGIN` (frontend domain allowlist)
- `PUBLIC_SERVER_URL` (public CMS URL)

## Object storage and CDN
- `S3_BUCKET` (or equivalent)
- `S3_REGION`
- `S3_ENDPOINT` (for S3-compatible services)
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `MEDIA_CDN_BASE_URL` (e.g. `https://media.example.com`)
