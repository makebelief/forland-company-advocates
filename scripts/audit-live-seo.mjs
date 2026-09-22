import { pages, site } from './seo-pages.mjs';

const base = (process.argv[2] || site.origin).replace(/\/$/, '');
const failures = [];
const internalLinks = new Set();
const results = [];

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

const sitemapResponse = await fetch(`${base}/sitemap.xml`);
const sitemapText = await sitemapResponse.text();
if (sitemapResponse.status !== 200 || (sitemapText.match(/<url>/g) || []).length !== Object.keys(pages).length) {
  addFailure('sitemap.xml', 'missing or route count does not match the registry');
}

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

const homepageHtml = await (await fetch(`${base}/`)).text();
const analyticsInstalled = /googletagmanager\.com|\bgtag\(|G-[A-Z0-9]+|GTM-[A-Z0-9]+/i.test(homepageHtml);

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
