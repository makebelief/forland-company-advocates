import { access, readFile } from 'node:fs/promises';

const verifyDist = process.argv.includes('--dist');
const required = [
  'api/admin/login.js',
  'api/admin/logout.js',
  'api/admin/session.js',
  'api/admin/change-password.js',
  'api/admin/forgot-password.js',
  'api/admin/complete-recovery.js',
  'api/admin/cms.js',
  'api/admin/media.js',
  'api/cms/public.js',
  'api/cms/page.js',
  'api/sitemap.js',
  'lib/admin-auth.js',
  'lib/cms-data.js',
  'public/admin/index.html',
  'public/admin/dashboard.html',
  'public/admin/admin.js',
  'public/admin/dashboard.js',
  'public/assets/js/cms-runtime.js',
  'public/assets/js/practice-overview-images.js',
  'public/assets/css/cms-runtime.css',
  'public/assets/css/practice-overview-images.css',
  'supabase/migrations/20260923193000_cms_schema.sql',
  'supabase/migrations/20260924070000_editorial_workflow.sql',
];
await Promise.all(required.map((file) => access(file)));

const index = await readFile('index.html', 'utf8');
if ((index.match(/cms-runtime\.js/g) || []).length !== 1) throw new Error('CMS runtime must load exactly once.');
if ((index.match(/cms-runtime\.css/g) || []).length !== 1) throw new Error('CMS stylesheet must load exactly once.');
if (!index.includes('/assets/js/cms-runtime.js?v=20260928-1')) throw new Error('CMS runtime cache-busting version is missing.');
if ((index.match(/practice-overview-images\.js/g) || []).length !== 1) throw new Error('Practice overview image enhancer must load exactly once.');
if ((index.match(/practice-overview-images\.css/g) || []).length !== 1) throw new Error('Practice overview image stylesheet must load exactly once.');

const admin = await readFile('public/admin/index.html', 'utf8');
const dashboard = await readFile('public/admin/dashboard.html', 'utf8');
const dashboardScript = await readFile('public/admin/dashboard.js', 'utf8');
for (const html of [admin, dashboard]) {
  if (!/name="robots" content="noindex, nofollow, noarchive"/.test(html)) throw new Error('Admin HTML must be noindex/nofollow.');
}
for (const label of ['Insights', 'Team Members', 'Practice Areas', 'Contact Details', 'View Website', 'Log Out']) {
  if (!dashboard.includes(label)) throw new Error('Dashboard navigation is missing: ' + label);
}
for (const marker of ["const SITE_ORIGIN = 'https://forlandcompanyadvocates.co.ke'", 'Copy article link', 'View article', "resource==='insights'"]) {
  if (!dashboardScript.includes(marker)) throw new Error('Published insight sharing control is missing: ' + marker);
}
for (const marker of ['Save Draft', 'Preview', 'Publish', 'Unpublish', 'Restore Previous Version', 'featured_image_alt', 'related_practice_area_id', 'formattedMarkup']) {
  if (!dashboard.includes(marker) && !dashboardScript.includes(marker)) throw new Error('Editorial workflow marker is missing: ' + marker);
}

const frontendFiles = [
  'public/admin/admin.js',
  'public/admin/dashboard.js',
  'public/assets/js/cms-runtime.js',
  'public/admin/index.html',
  'public/admin/dashboard.html',
];
for (const file of frontendFiles) {
  const contents = await readFile(file, 'utf8');
  for (const marker of ['SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'service_role']) {
    if (contents.includes(marker)) throw new Error(file + ' exposes a privileged server marker: ' + marker);
  }
  if (file.endsWith('.js') && /\b(?:password|adminPassword)\s*[:=]\s*["'][^"']{4,}["']/i.test(contents)) throw new Error(file + ' appears to hard-code a password.');
}

const auth = await readFile('lib/admin-auth.js', 'utf8');
for (const marker of ['HttpOnly', 'Secure', 'SameSite=Strict', 'forlandcompanyadvocates@gmail.com', 'allowForcedPasswordChange']) {
  if (!auth.includes(marker)) throw new Error('Auth hardening marker is missing: ' + marker);
}

const cmsApi = await readFile('api/admin/cms.js', 'utf8');
const mediaApi = await readFile('api/admin/media.js', 'utf8');
for (const [file, contents] of [['api/admin/cms.js', cmsApi], ['api/admin/media.js', mediaApi]]) {
  if (!contents.includes('requireSameOrigin') || !contents.includes('allowForcedPasswordChange: false')) {
    throw new Error(file + ' must require same-origin and a fully active admin session.');
  }
}
for (const marker of ['detectedMime', 'MIME_EXTENSIONS', 'MAX_JSON_BYTES', 'crypto.randomUUID']) {
  if (!mediaApi.includes(marker)) throw new Error('Media validation marker is missing: ' + marker);
}

const publicApi = await readFile('api/cms/public.js', 'utf8');
const data = await readFile('lib/cms-data.js', 'utf8');
const cmsRuntime = await readFile('public/assets/js/cms-runtime.js', 'utf8');
const practiceOverviewImages = await readFile('public/assets/js/practice-overview-images.js', 'utf8');
if (!publicApi.includes('publicOnly: true')) throw new Error('Public CMS API must request published content only.');
if (!data.includes('cms_settings?key=in.(site,seo)')) throw new Error('Public settings must be allow-listed.');
if (!data.includes('is_published=eq.true')) throw new Error('Public records must be filtered by publish state.');
if (!cmsRuntime.includes("new Set(['/practice-areas', '/our-team', '/insights'])")) throw new Error('Approved compiled list-page layouts must be explicitly preserved.');
for (const renderer of ['renderPracticeList', 'renderTeam', 'renderInsights']) {
  if (cmsRuntime.includes(renderer)) throw new Error('CMS runtime must not replace an approved compiled list-page layout: ' + renderer);
}
for (const slug of ['corporate-commercial', 'litigation-dispute', 'real-estate', 'employment-labour', 'banking-finance', 'technology-data-ip', 'immigration-mobility', 'estate-planning', 'construction-projects', 'energy-emobility']) {
  if (!practiceOverviewImages.includes(`'${slug}'`)) throw new Error('Practice overview image mapping is missing: ' + slug);
}

const sitemap = await readFile('public/sitemap.xml', 'utf8');
if (sitemap.includes('/admin')) throw new Error('Admin routes must not be present in the sitemap.');
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
if (!vercel.rewrites.some((rule) => rule.source === '/sitemap.xml' && rule.destination === '/api/sitemap')) throw new Error('Live sitemap rewrite is missing.');
if (!vercel.rewrites.some((rule) => rule.source === '/practice-areas/:slug')) throw new Error('Dynamic practice routing is missing.');
if (!vercel.rewrites.some((rule) => rule.source === '/insights/:slug')) throw new Error('Dynamic insight routing is missing.');
if (vercel.rewrites.some((rule) => rule.source === '/(.*)')) throw new Error('A soft-404 catch-all must not be configured.');
if (!vercel.headers.some((rule) => rule.source === '/assets/js/cms-runtime.js' && rule.headers?.some((header) => header.key === 'Cache-Control' && header.value.includes('must-revalidate')))) {
  throw new Error('CMS runtime must revalidate so returning visitors cannot retain stale layout code.');
}

const migration = await readFile('supabase/migrations/20260923193000_cms_schema.sql', 'utf8');
for (const table of ['admin_security', 'cms_pages', 'cms_practice_areas', 'cms_team_members', 'cms_insights', 'cms_media', 'cms_settings', 'cms_audit_log']) {
  if (!migration.includes('alter table public.' + table + ' enable row level security')) throw new Error('Migration is missing RLS for ' + table);
}
if (!migration.includes('revoke all on table') || !migration.includes('from anon, authenticated')) throw new Error('Migration must revoke browser-role table privileges.');
const editorialMigration = await readFile('supabase/migrations/20260924070000_editorial_workflow.sql', 'utf8');
for (const marker of ['featured_image_alt', 'related_practice_area_id', 'create table if not exists public.cms_revisions', 'alter table public.cms_revisions enable row level security', 'revoke all on table public.cms_revisions from anon, authenticated']) {
  if (!editorialMigration.includes(marker)) throw new Error('Editorial migration marker is missing: ' + marker);
}

if (verifyDist) {
  for (const file of ['dist/admin/index.html', 'dist/admin/dashboard.html', 'dist/assets/js/cms-runtime.js', 'dist/assets/css/cms-runtime.css']) await access(file);
  const distIndex = await readFile('dist/index.html', 'utf8');
  if ((distIndex.match(/cms-runtime\.js/g) || []).length !== 1) throw new Error('Built site must load the CMS runtime once.');
}
console.log('CMS, authentication, routing and security checks passed.');
