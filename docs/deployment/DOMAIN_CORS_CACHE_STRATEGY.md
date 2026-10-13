# Domain, CORS, Images, and Cache Strategy

## Domain and subdomain layout
- `studio.example.com` -> Firebase Hosting (frontend).
- `cms.example.com` -> Render Web Service (CMS API/admin).
- `media.example.com` -> CDN over object storage.

## CORS strategy
- Set explicit allowlist in CMS: frontend production/staging origins only.
- Allow methods: `GET,POST,PUT,PATCH,DELETE,OPTIONS` as required.
- Allow headers: `Content-Type, Authorization` and any custom headers.
- Avoid wildcard origin in production.

## Image hosting strategy
- Store original uploads in object storage.
- Generate responsive variants (small/medium/large) from CMS or image pipeline.
- Return CDN URLs in CMS payload.
- Keep frontend image components lazy loaded and sized with width/height/aspect-ratio to avoid layout shifts.

## Cache strategy
- Firebase static assets (`*.js, *.css`): `max-age=31536000, immutable`.
- HTML/shell (`index.html`): `no-cache`.
- CMS API responses:
  - For public content lists/details, use short CDN or reverse-proxy cache (e.g. 60-300s) where acceptable.
  - Invalidate cache on publish webhooks if strict freshness is needed.
- Media files on CDN: long TTL (30d+) and content-hash filenames when possible.
