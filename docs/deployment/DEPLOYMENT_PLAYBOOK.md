# Studio Website Deployment Playbook

## Architecture summary
- Frontend: Angular app on Firebase Hosting.
- Backend CMS: Strapi or Payload on Render Web Service.
- Data: Managed Postgres.
- Media: Object storage + CDN.

## SSR / hybrid rendering guidance
- Current Angular app outputs server + browser bundles.
- For Firebase Hosting-only deployment:
  - Use static browser output and prerender important routes.
  - Dynamic pages can be hydrated client-side or prerendered by exporting known slugs at build time.
- For runtime SSR on Firebase ecosystem:
  - Host Node SSR entry on Cloud Functions or Cloud Run and route via Hosting rewrites.

## Environment separation
- `development`: local APIs, optional mock mode.
- `staging`: real CMS staging endpoint, no mock mode.
- `production`: real production CMS endpoint, no mock mode.

## Command reference
- Local dev: `npm start`
- Build dev: `npm run build:dev`
- Build staging: `npm run build:staging`
- Build prod: `npm run build:prod`
- Build firebase hosting target: `npm run build:hosting`
- Deploy hosting: `npm run deploy:firebase`

## Required docs
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Firebase setup: [FIREBASE_HOSTING_SETUP.md](FIREBASE_HOSTING_SETUP.md)
- Render setup: [RENDER_CMS_SETUP.md](RENDER_CMS_SETUP.md)
- Env vars: [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- Domain/CORS/cache/image: [DOMAIN_CORS_CACHE_STRATEGY.md](DOMAIN_CORS_CACHE_STRATEGY.md)
- Production checklist: [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)
