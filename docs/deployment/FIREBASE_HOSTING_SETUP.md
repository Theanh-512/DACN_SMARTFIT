# Firebase Hosting Setup (Angular Frontend)

## 1. Prerequisites
- Firebase project created.
- Firebase CLI installed: `npm i -g firebase-tools`.
- Login: `firebase login`.

## 2. Build strategy for Firebase
- Current deployment target is static hosting: use browser output from `ng build`.
- Command: `npm run build:hosting`.
- Output path: `dist/studio-web/browser`.

## 3. Initialize Firebase in repo
- Run `firebase init hosting`.
- Set public directory to `dist/studio-web/browser`.
- Configure as SPA rewrite to `index.html`.

## 4. Deploy
- `npm run build:hosting`
- `npm run deploy:firebase`

## 5. Notes for SSR/hybrid on Firebase
- Firebase Hosting alone serves static assets only.
- If you need runtime SSR:
  - Option A: prerender all SEO-critical routes and keep Hosting-only.
  - Option B: use Firebase Hosting + Cloud Functions/Cloud Run for Node SSR entry (`dist/studio-web/server/server.mjs`).
- Current app is hybrid capable; for Hosting-only, keep dynamic-detail routes either prerendered via known slugs or client-rendered fallback.

## 6. Suggested channel workflow
- `firebase hosting:channel:deploy staging` for preview QA.
- Promote tested release to production with `firebase deploy --only hosting`.
