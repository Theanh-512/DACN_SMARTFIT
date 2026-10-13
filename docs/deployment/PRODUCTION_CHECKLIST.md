# Production Configuration Checklist

## Frontend (Firebase)
- [ ] `environment.production.ts` updated with production API URLs.
- [ ] `useMock` is `false` in production.
- [ ] Build succeeds: `npm run build:prod`.
- [ ] Firebase Hosting rewrites and cache headers verified.
- [ ] Custom domain and SSL active.

## CMS (Render)
- [ ] Production environment variables set.
- [ ] Admin access restricted and strong credentials configured.
- [ ] Postgres backups enabled and restore tested.
- [ ] Upload provider configured for object storage.
- [ ] CORS limited to frontend domains.

## SEO and content
- [ ] Page SEO fields populated for key routes.
- [ ] Canonical URLs and OG images set in CMS.
- [ ] Robots/sitemap strategy configured.

## Performance and caching
- [ ] Static assets immutable cache enabled.
- [ ] HTML/no-hash entry documents set to `no-cache`.
- [ ] Media uses CDN URLs and long-lived cache headers.

## Security and ops
- [ ] HTTPS only.
- [ ] Rate limiting and request size limits configured on CMS.
- [ ] Monitoring/alerts enabled (uptime, 5xx, DB load).
- [ ] Rollback strategy documented.
