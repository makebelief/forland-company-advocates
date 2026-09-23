import { readFile } from 'node:fs/promises';
import { method } from '../lib/admin-auth.js';
import { snapshot } from '../lib/cms-data.js';

const ORIGIN = 'https://forlandcompanyadvocates.co.ke';
const fallbackPromise = readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const pagePaths = { home: '/', about: '/about', 'practice-areas': '/practice-areas', 'our-team': '/our-team', insights: '/insights', contact: '/contact' };
const escapeXml = (value) => String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const absoluteImage = (value) => !value ? '' : value.startsWith('/') ? ORIGIN + value : value;

function entry(path, lastmod = '', image = '') {
  const parts = ['  <url>', '    <loc>' + escapeXml(ORIGIN + path) + '</loc>'];
  if (lastmod) parts.push('    <lastmod>' + escapeXml(String(lastmod).slice(0, 10)) + '</lastmod>');
  if (image) parts.push('    <image:image>', '      <image:loc>' + escapeXml(image) + '</image:loc>', '    </image:image>');
  parts.push('  </url>');
  return parts.join('\n');
}

function build(data) {
  const entries = [];
  const seen = new Set();
  const add = (path, lastmod, image) => {
    if (seen.has(path)) return;
    seen.add(path);
    entries.push(entry(path, lastmod, image || ORIGIN + '/assets/media/hero-poster-nairobi.jpg'));
  };
  for (const page of data.pages || []) {
    const path = pagePaths[page.slug];
    if (path && page.is_published !== false) add(path, page.updated_at, absoluteImage(page.og_image_url));
  }
  add('/privacy-policy');
  add('/terms-of-use');
  for (const item of data.practiceAreas || []) if (item.is_published !== false) add('/practice-areas/' + item.slug, item.updated_at, absoluteImage(item.image_url));
  for (const item of data.insights || []) if (item.is_published !== false) add('/insights/' + item.slug, item.updated_at || item.published_at, absoluteImage(item.featured_image_url));
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' + entries.join('\n') + '\n</urlset>\n';
}

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  try {
    const xml = build(await snapshot({ publicOnly: true }));
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(xml);
  } catch {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(await fallbackPromise);
  }
}
