import { access, readFile } from 'node:fs/promises';
import { pages, site } from './seo-pages.mjs';

const verifyDist = process.argv.includes('--dist');
const requiredFiles = [
  'index.html',
  'public/assets/css/site.min.css',
  'public/assets/css/seo-fallback.css',
  'public/assets/css/fonts.css',
  'public/assets/css/analytics-consent.css',
  'public/assets/js/site.min.js',
  'public/assets/js/analytics-consent.js',
  'public/assets/js/route-meta.js',
  'public/assets/js/seo-navigation.js',
  'public/assets/js/wording-updates.js',
  'public/assets/media/forland-logo-header.webp',
  'public/assets/media/forland-logo-footer.webp',
  'public/assets/media/hero-poster-nairobi.webp',
  'public/assets/media/nairobi-drone-film-mobile-loop.mp4',
  'public/assets/media/nairobi-drone-film-loop.mp4',
  'public/assets/fonts/cormorant-garamond-latin.woff2',
  'public/assets/fonts/cormorant-garamond-italic-latin.woff2',
  'public/assets/fonts/inter-latin.woff2',
  'public/favicon.svg',
  'public/favicon-32x32.png',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/llms.txt',
];

await Promise.all(requiredFiles.map((file) => access(file)));

const searchableFiles = ['index.html', 'public/assets/js/site.min.js'];
const forbidden = ['meta name="readdy-project-version"', '/preview/b0664989-301a-40e2-9615-56e8c2c511fa/13239291', 'data-readdy-form'];

for (const file of searchableFiles) {
  const contents = await readFile(file, 'utf8');
  for (const marker of forbidden) {
    if (contents.includes(marker)) throw new Error(`${file} still contains forbidden marker: ${marker}`);
  }
}

const index = await readFile('index.html', 'utf8');
if (index.includes('meta name="keywords"')) throw new Error('Obsolete meta keywords should not be present.');
if (!index.includes('<html lang="en-KE">')) throw new Error('The document language must be en-KE.');
if (!index.includes('favicon-32x32.png')) throw new Error('A PNG search-result favicon is required.');
if (index.includes('fonts.googleapis.com')) throw new Error('Production HTML should use the local font assets.');
if (index.includes('fontawesome.min.css')) throw new Error('Unused Font Awesome CSS must not block rendering.');
if (!index.includes('data-measurement-id="G-084LNP4DC1"')) throw new Error('The GA4 measurement ID is missing from the document.');
if (!index.includes('/assets/js/analytics-consent.js')) throw new Error('The consent-aware Analytics loader is missing.');

const analyticsConsent = await readFile('public/assets/js/analytics-consent.js', 'utf8');
if (!analyticsConsent.includes("analytics_storage: 'denied'")) throw new Error('GA4 must default analytics consent to denied.');
if (!analyticsConsent.includes("ad_storage: 'denied'")) throw new Error('GA4 advertising storage must remain disabled.');
if (!analyticsConsent.includes('https://www.googletagmanager.com/gtag/js')) throw new Error('The GA4 loader endpoint is missing.');
for (const eventName of ['page_view', 'phone_click', 'whatsapp_click', 'email_click', 'generate_lead', 'consultation_click']) {
  if (!analyticsConsent.includes(`'${eventName}'`)) throw new Error(`GA4 event is missing: ${eventName}`);
}
if (analyticsConsent.includes('link_url: href')) throw new Error('GA4 click events must not transmit contact URLs.');
if (analyticsConsent.includes("'contact_click'")) throw new Error('Legacy contact_click should use consultation_click.');
if ((index.match(/data-measurement-id="G-084LNP4DC1"/g) || []).length !== 1) {
  throw new Error('The document must contain exactly one GA4 loader configuration.');
}
if (/src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js/i.test(index)) throw new Error('A duplicate direct Google tag is installed.');

const bundle = await readFile('public/assets/js/site.min.js', 'utf8');
const requiredMarkers = [
  'path:`/privacy-policy`',
  'path:`/terms-of-use`',
  'Page not found',
  'form-name`,`contact',
  '/assets/media/nairobi-drone-film-mobile-loop.mp4',
  '/assets/media/nairobi-drone-film-loop.mp4',
  '/assets/media/hero-poster-nairobi.webp',
  '/api/contact',
  '/assets/media/asbjorn-ngani-portrait.webp',
];
const forbiddenProductionMarkers = [
  '[PHONE NUMBER]',
  '[EMAIL ADDRESS]',
  '[OFFICE ADDRESS]',
  '[OFFICE HOURS]',
  'This page has not been generated',
];

for (const marker of requiredMarkers) {
  if (!bundle.includes(marker)) throw new Error(`Application bundle is missing: ${marker}`);
}
if ((bundle.split('o.append(`form-name`,`contact`),').length - 1) !== 1) {
  throw new Error('The contact request must include exactly one form-name field.');
}
if ((bundle.match(/loading:`lazy`/g) || []).length !== 14) {
  throw new Error('All 14 content images should use native lazy loading.');
}
const wording = await readFile('public/assets/js/wording-updates.js', 'utf8');
if (!wording.includes('"Practical Legal Solutions for Business, Investment and Growth"')) {
  throw new Error('The interactive homepage H1 must match the crawlable SEO heading.');
}
const footerH4 = '(`h4`,{className:`text-xs font-semibold tracking-[0.2em] text-background-50 uppercase`';
const footerH2 = '(`h2`,{className:`text-xs font-semibold tracking-[0.2em] text-background-50 uppercase`';
if (bundle.includes(footerH4) || (bundle.split(footerH2).length - 1) !== 3) {
  throw new Error('Footer headings must use a sequential H2 outline.');
}
for (const marker of forbiddenProductionMarkers) {
  if (bundle.includes(marker)) throw new Error(`Application bundle contains production blocker: ${marker}`);
}

const pageList = Object.values(pages);
if (new Set(pageList.map((page) => page.title)).size !== pageList.length) throw new Error('SEO titles must be unique.');
if (new Set(pageList.map((page) => page.description)).size !== pageList.length) {
  throw new Error('Meta descriptions must be unique.');
}

for (const [path, page] of Object.entries(pages)) {
  if (page.title.length < 30 || page.title.length > 70) throw new Error(`SEO title length is unsuitable for ${path}: ${page.title.length}`);
  if (page.description.length < 110 || page.description.length > 170) throw new Error(`Meta description length is unsuitable for ${path}: ${page.description.length}`);
  if (!page.h1 || !page.image?.src || !page.image?.alt) throw new Error(`SEO content is incomplete for ${path}.`);
  await access(`public${page.image.src}`);
  if (page.type === 'article' && !page.relatedPracticePath) throw new Error(`Insight is missing a related practice link: ${path}`);
  if (page.relatedPracticePath && !pages[page.relatedPracticePath]) {
    throw new Error(`Related practice route does not exist for ${path}: ${page.relatedPracticePath}`);
  }
}

const sitemap = await readFile('public/sitemap.xml', 'utf8');
if (!sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
  throw new Error('The image sitemap namespace is missing.');
}
for (const path of Object.keys(pages)) {
  const url = site.origin + (path === '/' ? '/' : path);
  if (!sitemap.includes(`<loc>${url}</loc>`)) throw new Error(`Sitemap is missing: ${url}`);
}
if ((sitemap.match(/<url>/g) || []).length !== Object.keys(pages).length) {
  throw new Error('Sitemap URL count does not match the SEO route registry.');
}
if ((sitemap.match(/<image:image>/g) || []).length !== Object.keys(pages).length) {
  throw new Error('Every sitemap route must include a discoverable image.');
}

const robots = await readFile('public/robots.txt', 'utf8');
if (!robots.includes(`Sitemap: ${site.origin}/sitemap.xml`)) throw new Error('robots.txt does not advertise the sitemap.');

const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
if (vercel.rewrites?.some((rule) => rule.source === '/(.*)' && rule.destination === '/index.html')) {
  throw new Error('The Vercel catch-all creates indexable soft 404 responses.');
}

if (verifyDist) {
  for (const [path, page] of Object.entries(pages)) {
    const file = path === '/' ? 'dist/index.html' : `dist${path}/index.html`;
    const html = await readFile(file, 'utf8');
    const url = site.origin + (path === '/' ? '/' : path);
    const escapedTitle = page.title.replaceAll('&', '&amp;');
    const escapedDescription = page.description.replaceAll('&', '&amp;');
    if (!html.includes(`<link rel="canonical" href="${url}"`)) throw new Error(`${file} has the wrong canonical URL.`);
    if (!html.includes(`>${page.h1.replaceAll('&', '&amp;')}</h1>`)) throw new Error(`${file} is missing its pre-rendered H1.`);
    if (!html.includes('class="seo-fallback-hero"')) throw new Error(`${file} is missing the branded loading hero.`);
    if (html.includes('<div id="root"></div>')) throw new Error(`${file} has an empty application shell.`);
    if (!html.includes(`${site.origin}${page.image.src}`)) throw new Error(`${file} is missing its route-specific social image.`);
    if ((html.match(/<h1\b/gi) || []).length !== 1) throw new Error(`${file} must contain exactly one H1.`);
    if (!/name="robots" content="index, follow/.test(html)) throw new Error(`${file} is accidentally non-indexable.`);
    const socialMarkers = [
      `property="og:title" content="${escapedTitle}"`,
      `property="og:description" content="${escapedDescription}"`,
      `property="og:url" content="${url}"`,
      `name="twitter:title" content="${escapedTitle}"`,
      `name="twitter:description" content="${escapedDescription}"`,
      'name="twitter:card" content="summary_large_image"',
    ];
    for (const marker of socialMarkers) {
      if (!html.includes(marker)) throw new Error(`${file} has incomplete social metadata: ${marker}`);
    }
    if ((html.match(/type="application\/ld\+json"/g) || []).length !== 1) throw new Error(`${file} must contain exactly one JSON-LD graph.`);
    if (page.relatedPracticePath && !html.includes(`href="${page.relatedPracticePath}"`)) {
      throw new Error(`${file} is missing its related practice-area link.`);
    }
    const match = html.match(/<script id="structured-data" type="application\/ld\+json">(.*?)<\/script>/s);
    if (!match) throw new Error(`${file} is missing JSON-LD.`);
    const schema = JSON.parse(match[1]);
    if (schema['@context'] !== 'https://schema.org' || !Array.isArray(schema['@graph'])) {
      throw new Error(`${file} has invalid JSON-LD.`);
    }
    const schemaTypes = schema['@graph'].flatMap((item) => (
      Array.isArray(item['@type']) ? item['@type'] : [item['@type']]
    )).filter(Boolean);
    for (const requiredType of ['LegalService', 'Organization', 'WebSite']) {
      if (!schemaTypes.includes(requiredType)) throw new Error(`${file} is missing ${requiredType} schema.`);
    }
    if (path !== '/' && !schemaTypes.includes('BreadcrumbList')) {
      throw new Error(`${file} is missing BreadcrumbList schema.`);
    }
    if (page.type === 'article' && !schemaTypes.includes('Article')) {
      throw new Error(`${file} is missing Article schema.`);
    }
    if (path !== '/' && !html.includes('class="seo-fallback-breadcrumb"')) {
      throw new Error(`${file} is missing crawlable breadcrumb navigation.`);
    }
  }

  const notFound = await readFile('dist/404.html', 'utf8');
  if (!notFound.includes('content="noindex, follow"')) throw new Error('The static 404 page must be noindex.');
  if (notFound.includes('rel="canonical"') || notFound.includes('id="structured-data"')) {
    throw new Error('The static 404 page must not claim canonical or structured-data entities.');
  }
  if (notFound.includes('property="og:') || notFound.includes('name="twitter:') || notFound.includes('name="geo.')) {
    throw new Error('The static 404 page must not expose stale social or geographic metadata.');
  }
}

console.log(`Project, SEO registry${verifyDist ? ' and generated HTML' : ''} checks passed.`);
