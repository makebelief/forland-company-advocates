import { access, readFile } from 'node:fs/promises';
import { pages, site } from './seo-pages.mjs';

const requiredFiles = [
  'index.html',
  'public/assets/css/site.min.css',
  'public/assets/js/site.min.js',
  'public/assets/js/route-meta.js',
  'public/favicon.svg',
  'public/robots.txt',
  'public/sitemap.xml',
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

const bundle = await readFile('public/assets/js/site.min.js', 'utf8');
const requiredMarkers = [
  'path:`/privacy-policy`',
  'path:`/terms-of-use`',
  'Page not found',
  'form-name`,`contact',
  '/assets/media/nairobi-drone-film.mp4',
  'Frequently asked questions',
  'var PracticeSEO={',
];
const forbiddenProductionMarkers = [
  '[PHONE NUMBER]',
  '[EMAIL ADDRESS]',
  '[OFFICE ADDRESS]',
  '[OFFICE HOURS]',
  'This page has not been generated',
  '/api/contact',
];

for (const marker of requiredMarkers) {
  if (!bundle.includes(marker)) throw new Error(`Application bundle is missing: ${marker}`);
}
for (const marker of forbiddenProductionMarkers) {
  if (bundle.includes(marker)) throw new Error(`Application bundle contains production blocker: ${marker}`);
}

const sitemap = await readFile('public/sitemap.xml', 'utf8');
for (const path of Object.keys(pages)) {
  const url = site.origin + (path === '/' ? '/' : path);
  if (!sitemap.includes(`<loc>${url}</loc>`)) throw new Error(`Sitemap is missing: ${url}`);
}
if ((sitemap.match(/<url>/g) || []).length !== Object.keys(pages).length) {
  throw new Error('Sitemap URL count does not match the SEO route registry.');
}

if (!sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')) {
  throw new Error('Sitemap is missing the Google image sitemap namespace.');
}

const robots = await readFile('public/robots.txt', 'utf8');
if (!robots.includes(`Sitemap: ${site.origin}/sitemap.xml`)) {
  throw new Error('robots.txt does not advertise the canonical sitemap URL.');
}

for (const [path, page] of Object.entries(pages)) {
  const imagePath = `public${page.image}`;
  await access(imagePath).catch(() => { throw new Error(`SEO image is missing for ${path}: ${imagePath}`); });
  const imageUrl = `${site.origin}${page.image}`;
  if (!sitemap.includes(`<image:loc>${imageUrl}</image:loc>`)) {
    throw new Error(`Image sitemap entry is missing for ${path}: ${imageUrl}`);
  }
}

for (const [path, page] of Object.entries(pages)) {
  if (page.title.length < 30 || page.title.length > 70) throw new Error(`SEO title length is unsuitable for ${path}: ${page.title.length}`);
  if (page.description.length < 110 || page.description.length > 170) throw new Error(`Meta description length is unsuitable for ${path}: ${page.description.length}`);
}

console.log('Project structure and branding checks passed.');
