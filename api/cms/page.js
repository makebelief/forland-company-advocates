import { readFile } from 'node:fs/promises';
import { method } from '../../lib/admin-auth.js';
import { snapshot } from '../../lib/cms-data.js';

const ORIGIN = 'https://forlandcompanyadvocates.co.ke';
const templatePromise = readFile(new URL('../../index.html', import.meta.url), 'utf8');
const builtIn = {
  practice: new Set(['corporate-commercial', 'litigation-dispute', 'real-estate', 'employment-labour', 'banking-finance', 'technology-data-ip', 'immigration-mobility', 'estate-planning', 'construction-projects', 'energy-emobility']),
  insight: new Set(['establishing-business', 'commercial-agreement', 'emobility-sector', 'corporate-governance', 'property-due-diligence', 'employment-compliance']),
};
const notFound = '<!doctype html><html lang="en-KE"><title>Page not found</title><meta name="robots" content="noindex, follow"><body><h1>Page not found</h1><p><a href="/">Return home</a></p></body></html>';
const escapeHtml = (value) => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function schema(record, type, canonical, image) {
  const graph = [
    { '@type': ['LegalService', 'Organization'], '@id': ORIGIN + '/#organization', name: 'Forland & Company Advocates', url: ORIGIN + '/' },
    { '@type': 'WebSite', '@id': ORIGIN + '/#website', url: ORIGIN + '/', name: 'Forland & Company Advocates', publisher: { '@id': ORIGIN + '/#organization' } },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN + '/' },
      { '@type': 'ListItem', position: 2, name: type === 'insight' ? 'Insights' : 'Practice Areas', item: ORIGIN + '/' + (type === 'insight' ? 'insights' : 'practice-areas') },
      { '@type': 'ListItem', position: 3, name: record.title, item: canonical },
    ] },
  ];
  if (type === 'insight') graph.push({
    '@type': 'Article',
    headline: record.title,
    description: record.meta_description || record.excerpt,
    mainEntityOfPage: canonical,
    image,
    datePublished: record.published_at || record.created_at,
    dateModified: record.updated_at,
    author: { '@type': 'Organization', name: record.author || 'Forland & Company Advocates' },
    publisher: { '@id': ORIGIN + '/#organization' },
  });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c');
}

async function render(record, type) {
  let html = await templatePromise;
  const prefix = type === 'insight' ? 'insights' : 'practice-areas';
  const canonical = ORIGIN + '/' + prefix + '/' + record.slug;
  const title = record.seo_title || record.title + ' | Forland & Company Advocates';
  const description = record.meta_description || record.excerpt || record.summary || '';
  const rawImage = type === 'insight' ? record.featured_image_url : record.image_url;
  const image = rawImage ? (rawImage.startsWith('/') ? ORIGIN + rawImage : rawImage) : ORIGIN + '/assets/media/hero-poster-nairobi.jpg';
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const safeImage = escapeHtml(image);
  const replacements = [
    [/<title>.*?<\/title>/s, '<title>' + safeTitle + '</title>'],
    [/<meta name="description"[^>]*>/, '<meta name="description" content="' + safeDescription + '" />'],
    [/<meta name="robots"[^>]*>/, '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />'],
    [/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="' + safeCanonical + '" />'],
    [/<meta property="og:type"[^>]*>/, '<meta property="og:type" content="' + (type === 'insight' ? 'article' : 'website') + '" />'],
    [/<meta property="og:title"[^>]*>/, '<meta property="og:title" content="' + safeTitle + '" />'],
    [/<meta property="og:description"[^>]*>/, '<meta property="og:description" content="' + safeDescription + '" />'],
    [/<meta property="og:url"[^>]*>/, '<meta property="og:url" content="' + safeCanonical + '" />'],
    [/<meta property="og:image"[^>]*>/, '<meta property="og:image" content="' + safeImage + '" />'],
    [/<meta name="twitter:title"[^>]*>/, '<meta name="twitter:title" content="' + safeTitle + '" />'],
    [/<meta name="twitter:description"[^>]*>/, '<meta name="twitter:description" content="' + safeDescription + '" />'],
    [/<meta name="twitter:image"[^>]*>/, '<meta name="twitter:image" content="' + safeImage + '" />'],
  ];
  for (const [pattern, tag] of replacements) html = html.replace(pattern, tag);
  html = html.replace('</head>', '    <script id="structured-data" type="application/ld+json">' + schema(record, type, canonical, image) + '</script>\n  </head>');
  html = html.replace('<div id="root"></div>', '<div id="root"><main class="seo-fallback-main" id="main-content"><article><h1>' + escapeHtml(record.title) + '</h1><p>' + safeDescription + '</p></article></main></div>');
  return html;
}

function send(res, status, html, cache = 'no-store') {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (status !== 200) res.setHeader('X-Robots-Tag', 'noindex, follow');
  res.end(html);
}

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  const url = new URL(req.url, 'https://cms.local');
  const type = url.searchParams.get('type');
  const slug = url.searchParams.get('slug') || '';
  if (!['practice', 'insight'].includes(type) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return send(res, 404, notFound);
  try {
    const data = await snapshot({ publicOnly: true });
    const record = (type === 'practice' ? data.practiceAreas : data.insights).find((item) => item.slug === slug && item.is_published !== false);
    if (!record) return send(res, 404, notFound);
    return send(res, 200, await render(record, type), 'public, s-maxage=60, stale-while-revalidate=300');
  } catch {
    if (builtIn[type].has(slug)) return send(res, 200, await templatePromise, 'no-store');
    return send(res, 503, '<!doctype html><html lang="en-KE"><title>Temporarily unavailable</title><meta name="robots" content="noindex, follow"><body><h1>Temporarily unavailable</h1><p>Please try again shortly.</p></body></html>');
  }
}
