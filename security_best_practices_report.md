# Security Audit and Hardening Report

## Scope
This audit covered server routes, request validation, data schemas, and client-side rendering paths in the Express + MongoDB Pizza Hunt app.

## Implemented updates
1. Added API-only rate limiting middleware in `server.js` to reduce brute-force and abuse risk on mutation endpoints.
2. Added security headers in `server.js`: `Content-Security-Policy` allow-list for Google Fonts, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `X-DNS-Prefetch-Control`, `Cross-Origin-Resource-Policy`.
3. Removed debug query logging by forcing `mongoose.set('debug', false)` and set `mongoose.set('strictQuery', true)`.
4. Added strict object id validation for request params that represent Mongo `_id` values in both controllers.
5. Added centralized payload sanitation/length controls in `controllers/pizza-controller.js` and `controllers/comment-controller.js`.
6. Added explicit bad-payload responses (`400`) for missing/invalid data on create/update routes.
7. Tightened schema validation in `models/Pizza.js` and `models/Comment.js`:
   - length constraints
   - required text fields
   - topping-count limits
8. Removed user-controlled `innerHTML` rendering in `public/assets/js/pizza-list.js` and `public/assets/js/single-pizza.js`; all API values now render through DOM text nodes.
9. Fixed front-end submission paths to return parsed JSON before continuing flow.
10. Fixed custom topping add flow in `public/assets/js/add-pizza.js` to clear input and reject duplicate custom topping IDs.

## Risks addressed
1. Stored XSS in pizza/comment rendering.
2. API abuse via unbounded query volume.
3. Mongo object id injection / malformed id handling crashes.
4. Oversized/unvalidated free-text payloads leading to schema abuse.

## Recommended follow-up
1. [High] Add automated security dependency checks (e.g., Dependabot/OSS scanning) and keep `package-lock.json` refreshed.
2. [High] Add server tests for validation paths and mutation endpoints (unit + integration).
3. [High] Add `jest`/`supertest`-style API contract tests for invalid IDs, invalid payloads, and 4xx behavior.
4. [Medium] Add route-level authentication/authorization before allowing destructive operations (`DELETE`, `PUT`), even if app is public demo currently.
5. [Medium] Add a request timeout and input size guard at process/proxy layer as well (reverse proxy/CDN).
6. [Medium] Add HTTPS enforcement and secure cookie/session policy if sessions are added in future.
7. [Low] Consider adding `X-Permitted-Cross-Domain-Policies` and `Cross-Origin-Opener-Policy` headers.
