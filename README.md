# Forland & Company Advocates

Production website and content-management system for [forlandcompanyadvocates.co.ke](https://forlandcompanyadvocates.co.ke), deployed to the existing Vercel project `shayo-victors-projects/forland-company-advocates`.

The public application is a compiled React bundle with crawlable generated HTML. The administrator at `/admin` uses Supabase Authentication, server-side Vercel Functions and Supabase-backed CMS tables/storage.

## Development

```bash
npm ci
npm run dev
```

Use `vercel dev` when testing rewrites, security headers and server functions. Local environment files and `.vercel` metadata are ignored by Git.

## Verification and production build

```bash
npm test
npm run check
npm run build
vercel build --yes --target production
```

- `npm test` covers authentication boundaries, session recognition, CMS validation, publish filtering, dynamic 404s and media spoofing.
- `npm run check` verifies the existing SEO/analytics implementation plus CMS, admin, routing and secret-isolation requirements.
- `npm run build` writes optimized public output to `dist/` and verifies the generated HTML.
- `vercel build` validates the actual Vercel functions and route configuration.

## Project structure

- `index.html` — public application entry, global metadata and runtime loaders
- `public/admin` — noindex administrator login and dashboard
- `api/admin` — protected authentication, CMS and media functions
- `api/cms` — published-content API and dynamic public page renderer
- `api/sitemap.js` — published CMS sitemap with static fallback
- `lib` — server-only authentication, validation and Supabase data access
- `public/assets` — compiled application, CMS runtime, styles, fonts and media
- `scripts` — build, SEO, analytics and CMS verification
- `supabase/migrations` — reproducible CMS schema, RLS and storage configuration
- `test` — automated CMS/authentication tests

## Required server environment names

Vercel must provide the existing Supabase integration variables. Source code contains no credential values.

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` (or the supported anon/publishable fallback name)
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

Privileged keys are used only in server functions. They must never be prefixed for browser exposure or committed.

## Authentication and CMS

Only `forlandcompanyadvocates@gmail.com` is accepted by the server as the initial administrator. Sessions use Secure, HttpOnly, SameSite=Strict cookies. Public browser roles have no CMS table privileges or write policies; published content is served through allow-listed server endpoints.

Public sign-up must remain disabled in Supabase Dashboard under **Authentication → Providers → Email**. Password creation and resets are handled privately in Supabase/Auth flows; passwords and session tokens must never be placed in source, environment reports or Git.

CMS changes propagate through `/api/cms/public` with short edge caching. Published practice-area and insight routes are server-validated and the sitemap is generated from published records without requiring a new deployment.

## Deployment

Deploy only to the existing linked Vercel project. A normal release flow is:

```bash
vercel pull --yes --environment production
vercel build --yes --target production
vercel deploy --prebuilt
vercel promote <verified-deployment-url>
```

Do not create another repository, Vercel project or Supabase project.

## Contact and analytics

The existing public inquiry flow, consent-aware GA4 installation and privacy controls are preserved. GA4 remains denied until the visitor grants analytics consent.

## Source note

The public React application was supplied as a compiled bundle. The CMS, authentication, runtime integration, tests and server functions are maintained as source in this repository. Future redesign work should use the original React source if it becomes available.
