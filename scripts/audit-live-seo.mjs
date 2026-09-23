import { pages, site } from './seo-pages.mjs';

const base = (process.argv[2] || site.origin).replace(/\/$/, '');
const failures = [];
const internalLinks = new Set();
const results = [];
const seenTitles = new Map();
const seenDescriptions = new Map();

const decode = (value = '') => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .trim();

const tagAttribute = (html, tag, selectorName, selectorValue, attribute) => {
  const selector = new RegExp(`<${tag}[^>]*${selectorName}=["']${selectorValue}["'][^>]*>`, 'i');
  const matchedTag = html.match(selector)?.[0];
  return matchedTag?.match(new RegExp(`${attribute}=["']([^"']*)["']`, 'i'))?.[1] ?? null;
};

const addFailure = (path, message) => failures.push(`${path}: ${message}`);

for (const [path, page] of Object.entries(pages)) {
  const url = `${base}${path === '/' ? '/' : path}`;
  const response = await fetch(url);
  const html = await response.text();
  const title = decode(html.match(/<title>(.*?)<\/title>/is)?.[1]);
  const description = decode(tagAttribute(html, 'meta', 'name', 'description', 'content'));
  const canonical = tagAttribute(html, 'link', 'rel', 'canonical', 'href');
  const robots = tagAttribute(html, 'meta', 'name', 'robots', 'content');
  const ogTitle = decode(tagAttribute(html, 'meta', 'property', 'og:title', 'content'));
  const ogDescription = decode(tagAttribute(html, 'meta', 'property', 'og:description', 'content'));
  const ogUrl = tagAttribute(html, 'meta', 'property', 'og:url', 'content');
  const twitterTitle = decode(tagAttribute(html, 'meta', 'name', 'twitter:title', 'content'));
  const twitterDescription = decode(tagAttribute(html, 'meta', 'name', 'twitter:description', 'content'));
  const schemaCount = (html.match(/type=["']application\/ld\+json["']/gi) || []).length;
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const missingAltCount = (html.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) || []).length;
  const schemaText = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/is)?.[1];
  let schemaTypes = [];
  try {
    const schema = JSON.parse(schemaText);
    schemaTypes = (schema['@graph'] || []).flatMap((item) => (
      Array.isArray(item['@type']) ? item['@type'] : [item['@type']]
    )).filter(Boolean);
  } catch {
    addFailure(path, 'JSON-LD is missing or invalid');
  }

  if (response.status !== 200) addFailure(path, `expected 200, received ${response.status}`);
  if (title !== page.title) addFailure(path, 'title does not match the route registry');
  if (description !== page.description) addFailure(path, 'meta description does not match the route registry');
  if (canonical !== `${site.origin}${path === '/' ? '/' : path}`) addFailure(path, 'canonical URL is incorrect');
  if (seenTitles.has(title)) addFailure(path, `duplicates the title used by ${seenTitles.get(title)}`);
  else seenTitles.set(title, path);
  if (seenDescriptions.has(description)) addFailure(path, `duplicates the description used by ${seenDescriptions.get(description)}`);
  else seenDescriptions.set(description, path);
  if (ogTitle !== page.title || twitterTitle !== page.title) addFailure(path, 'social title metadata is incorrect');
  if (ogDescription !== page.description || twitterDescription !== page.description) addFailure(path, 'social description metadata is incorrect');
  if (ogUrl !== `${site.origin}${path === '/' ? '/' : path}`) addFailure(path, 'Open Graph URL is incorrect');
  if (schemaCount !== 1) addFailure(path, `expected one JSON-LD graph, found ${schemaCount}`);
  if (page.relatedPracticePath && !html.includes(`href="${page.relatedPracticePath}"`)) addFailure(path, 'related practice link is missing');
  if (page.type === 'article' && !schemaTypes.includes('Article')) addFailure(path, 'schema is missing Article');
  if (!robots?.startsWith('index, follow')) addFailure(path, 'page is not indexable');
  if (h1Count !== 1) addFailure(path, `expected one H1, found ${h1Count}`);
  if (missingAltCount) addFailure(path, `${missingAltCount} server-rendered images have no alt text`);
  for (const requiredType of ['LegalService', 'Organization', 'WebSite']) {
    if (!schemaTypes.includes(requiredType)) addFailure(path, `schema is missing ${requiredType}`);
  }
  if (path !== '/' && !schemaTypes.includes('BreadcrumbList')) addFailure(path, 'schema is missing BreadcrumbList');
  if (path === '/our-team' && !schemaTypes.includes('Person')) addFailure(path, 'schema is missing Person');

  for (const match of html.matchAll(/href=["']([^"'#?]+)["']/gi)) {
    if (match[1].startsWith('/')) internalLinks.add(match[1].replace(/\/$/, '') || '/');
  }

  results.push({ path, status: response.status, h1Count, missingAltCount, schemaTypes: [...new Set(schemaTypes)] });
}

const brokenLinks = [];
for (const path of internalLinks) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual' });
  if (response.status >= 400) brokenLinks.push({ path, status: response.status });
}
if (brokenLinks.length) addFailure('internal links', JSON.stringify(brokenLinks));

const notFound = await fetch(`${base}/seo-audit-intentional-404`);
const notFoundHtml = await notFound.text();
if (notFound.status !== 404) addFailure('404', `expected 404, received ${notFound.status}`);
if (!/name=["']robots["'][^>]*content=["']noindex, follow["']/i.test(notFoundHtml)) {
  addFailure('404', 'custom 404 does not contain noindex, follow');
}

const robotsResponse = await fetch(`${base}/robots.txt`);
const robotsText = await robotsResponse.text();
if (robotsResponse.status !== 200 || !robotsText.includes(`Sitemap: ${site.origin}/sitemap.xml`)) {
  addFailure('robots.txt', 'missing or does not advertise the canonical sitemap');
}
if (!/^Allow: \/$/m.test(robotsText)) addFailure('robots.txt', 'does not explicitly allow public crawling');

const sitemapResponse = await fetch(`${base}/sitemap.xml`);
const sitemapText = await sitemapResponse.text();
if (sitemapResponse.status !== 200 || (sitemapText.match(/<url>/g) || []).length !== Object.keys(pages).length) {
  addFailure('sitemap.xml', 'missing or route count does not match the registry');
}
for (const path of Object.keys(pages)) {
  const url = `${site.origin}${path === '/' ? '/' : path}`;
  if (!sitemapText.includes(`<loc>${url}</loc>`)) addFailure('sitemap.xml', `missing ${url}`);
}
if (/\.vercel\.app/i.test(sitemapText)) addFailure('sitemap.xml', 'contains a Vercel deployment URL');

const canonicalHost = new URL(site.origin).hostname;
const wwwHost = canonicalHost.startsWith('www.') ? canonicalHost.slice(4) : `www.${canonicalHost}`;
const alternateDomain = await fetch(`https://${wwwHost}/`, { redirect: 'manual' });
if (alternateDomain.status !== 308 || alternateDomain.headers.get('location') !== `${site.origin}/`) {
  addFailure('preferred domain', 'alternate hostname does not permanently redirect to the canonical origin');
}

const insecureDomain = await fetch(`http://${canonicalHost}/`, { redirect: 'manual' });
if (insecureDomain.status !== 308 || insecureDomain.headers.get('location') !== `${site.origin}/`) {
  addFailure('HTTPS', 'HTTP does not permanently redirect to the canonical HTTPS origin');
}

const homepageResponse = await fetch(`${base}/`);
const homepageHtml = await homepageResponse.text();
const analyticsResponse = await fetch(`${base}/assets/js/analytics-consent.js`);
const analyticsText = await analyticsResponse.text();
const analyticsInstalled = analyticsResponse.status === 200 && analyticsText.includes('G-084LNP4DC1');
if ((homepageHtml.match(/analytics-consent\.js/gi) || []).length !== 1) addFailure('GA4', 'expected exactly one analytics loader');
for (const eventName of ['page_view', 'phone_click', 'whatsapp_click', 'email_click', 'generate_lead', 'consultation_click']) {
  if (!analyticsText.includes(`'${eventName}'`)) addFailure('GA4', `event is missing: ${eventName}`);
}
if (!analyticsText.includes("analytics_storage: 'denied'")) addFailure('GA4', 'analytics consent does not default to denied');
if (analyticsText.includes('link_url: href')) addFailure('GA4', 'click events transmit contact URLs');
if (!homepageResponse.headers.get('content-security-policy')) addFailure('security headers', 'Content-Security-Policy is missing');

console.log(JSON.stringify({
  auditedOrigin: base,
  routes: results.length,
  internalLinks: internalLinks.size,
  brokenLinks,
  analyticsInstalled,
  failures,
  results,
}, null, 2));

if (failures.length) process.exitCode = 1;
