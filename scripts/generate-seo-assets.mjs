import { writeFile } from 'node:fs/promises';
import { pages, site, lastModified } from './seo-pages.mjs';

const json = JSON.stringify({ pages, site });
const runtime = `(() => {
  const data = ${json};
  const upsertMeta = (selector, attributes) => {
    let node = document.head.querySelector(selector);
    if (!node) { node = document.createElement('meta'); document.head.append(node); }
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  };
  const update = () => {
    const path = window.location.pathname.replace(/\\/$/, '') || '/';
    const page = data.pages[path];
    if (!page) { upsertMeta('meta[name="robots"]', { name: 'robots', content: 'noindex, follow' }); return; }
    const url = data.site.origin + (path === '/' ? '/' : path);
    const image = data.site.origin + data.site.image;
    document.title = page.title;
    upsertMeta('meta[name="description"]', { name: 'description', content: page.description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: page.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: page.description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: page.type });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: page.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: page.description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = url;
  };
  update();
  new MutationObserver(update).observe(document.getElementById('root'), { childList: true, subtree: true });
  window.addEventListener('popstate', update);
  document.addEventListener('click', () => window.setTimeout(update, 0), true);
})();\n`;

const urls = Object.keys(pages).map((path) => `  <url>\n    <loc>${site.origin}${path === '/' ? '/' : path}</loc>\n    <lastmod>${lastModified}</lastmod>\n  </url>`).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

await writeFile('public/assets/js/route-meta.js', runtime);
await writeFile('public/sitemap.xml', sitemap);
console.log(`Generated SEO metadata and sitemap for ${Object.keys(pages).length} routes.`);
