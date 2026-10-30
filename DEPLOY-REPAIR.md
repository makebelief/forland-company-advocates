# Forland & Company Advocates — repair notes and production deployment

## What was fixed

- The supplied file `Website Photo - Asbjorn.png` is included in compressed, locally served JPG/WebP form and appears in the compiled Managing Partner profile on `/our-team`; the profile description remains intact.
- Newly published team members are now mounted into the existing Team page instead of being silently skipped by the CMS runtime. A CMS team record with the managing partner's name may override his photo; there is a local fallback if that remote image fails.
- Large JPG/PNG/WebP images are automatically resized for the 2.5 MB upload limit. The admin now explains that the team record must be saved after the photo upload; storage failures return useful error messages.
- Failed media metadata writes clean up the uploaded storage object. Media deletion checks storage before deleting its database record.
- The public contact form now submits to Vercel `/api/contact`, rather than the Netlify-compatible POST to `/`. Successful submissions are saved to Supabase `cms_inquiries` before success is shown. Messages can be seen securely under `/admin/dashboard` → Inquiries.
- Automated checks cover a successful photo upload, wrong file signatures, storage failure feedback, inquiry validation, successful inquiry persistence and server failure responses.

## Apply this patch to your existing Git checkout

1. Back up or commit any uncommitted local changes first. The repair patch overwrites several frontend and server files.
2. Download `forland-repair-patch.zip`, and extract it **into the root** of the existing `forland-company-advocates` Git checkout (choose "Replace" for existing files). This preserves your `.git` history, GitHub remote, local Vercel `.vercel` project link and private environment files.
3. Open a VS Code terminal in that project root and run the commands below.

```bash
set -e
# Confirm that you are inside the *existing* Git repository and correct project.
git remote -v
git branch --show-current
npm ci
npm test
npm run check
npm run build

git add -A
git commit -m "Fix team photos, CMS uploads and Vercel inquiries"
git push origin main

# Choose your EXISTING Vercel project when prompted; do not create another.
npx vercel link
npx vercel env ls
npx vercel deploy --prod
```

If the GitHub repo is connected to Vercel, pushing to `main` can already trigger a production deployment. The explicit `npx vercel deploy --prod` step above may therefore create a second production deployment, but ensures that the local checked-out source is deployed if you choose to run it.

## Before declaring the site live

- In the **existing** Vercel project, ensure the **Production** environment has `SUPABASE_URL`, a Supabase publishable/anon key (`SUPABASE_PUBLISHABLE_KEY` or supported fallback), and `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`. Never paste the values into the repository.
- Verify the two existing SQL migrations in `supabase/migrations/` have been applied to **the Supabase project used in Production**. Confirm the `cms-media` Storage bucket and `cms_team_members`, `cms_media`, and `cms_inquiries` tables exist. This repair does **not** change Supabase migrations or assume they were deployed. Only apply migrations that are missing using the official Supabase migration workflow.
- The repository is configured for `https://forlandcompanyadvocates.co.ke` in `README.md`, `lib/admin-auth.js`, `scripts/seo-pages.mjs` and generated SEO. The domain `www.folandadvocates.co.ke` mentioned in the request is different. Check Vercel **Settings → Domains** and your domain registrar's DNS records. Do not change the domain references or add aliases without verifying ownership and the intended canonical domain.
- Test in Production: open `/our-team` and confirm the portrait, add a test team member with an image at `/admin`, save with Visible on website enabled and verify it appears publicly; submit a harmless test inquiry via `/contact`, then confirm that exact inquiry is present under **Inquiries** in `/admin/dashboard`.
- If photo upload still fails, check the error returned in the admin portal and Vercel Function logs for `/api/admin/media`. If inquiries fail, check the Vercel Function logs for `/api/contact`. These are backend-dependent and cannot be fully validated without your live Vercel/Supabase credentials.
- Admin has a single allow-listed login account configured in `lib/admin-auth.js`. Do not add unreviewed public registration or expose the Supabase secret to the browser.

## Local verification performed for this repair

`npm test` (21 checks) and `npm run check` passed. A static output assembled from public assets also passed `node scripts/verify-project.mjs --dist` and `node scripts/verify-cms.mjs --dist`, with crawlable pages and SPA fallback generated. The actual `npm run build` (Vite) and Vercel live integrations were **not** fully exercised in this sandbox: dependency installation could not finish due to package-registry access limitations. Run `npm ci && npm run build` in your own project before deploying.
