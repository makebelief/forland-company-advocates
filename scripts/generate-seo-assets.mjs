import { writeFile } from 'node:fs/promises';
import { buildStructuredData } from './seo-structured-data.mjs';
import { lastModified, pages, site } from './seo-pages.mjs';

const schemas = Object.fromEntries(
  Object.entries(pages).map(([path, page]) => [path, buildStructuredData(path, page)]),
);
const json = JSON.stringify({ pages, schemas, site }).replaceAll('<', '\\u003c');
const breadcrumbLabels = Object.fromEntries(
  Object.entries(pages).map(([path, page]) => [path, page.breadcrumbLabel]),
);
const breadcrumbJson = JSON.stringify(breadcrumbLabels).replaceAll('<', '\\u003c');
const runtime = `(() => {
  const data = ${json};
  const upsertMeta = (selector, attributes) => {
    let node = document.head.querySelector(selector);
    if (!node) { node = document.createElement('meta'); document.head.append(node); }
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
  };
  const removeMeta = (selector) => document.head.querySelector(selector)?.remove();
  const upsertLink = (selector, attributes) => {
    let node = document.head.querySelector(selector);
    if (!node) { node = document.createElement('link'); document.head.append(node); }
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  };
  const update = () => {
    const path = window.location.pathname.replace(/\\/+$/, '') || '/';
    const page = data.pages[path];
    if (!page) {
      document.title = 'Page Not Found | Forland & Company Advocates';
      upsertMeta('meta[name="robots"]', { name: 'robots', content: 'noindex, follow' });
      document.head.querySelector('link[rel="canonical"]')?.remove();
      return;
    }
    const url = data.site.origin + (path === '/' ? '/' : path);
    const image = data.site.origin + page.image.src;
    document.title = page.title;
    document.documentElement.lang = data.site.locale;
    upsertMeta('meta[name="description"]', { name: 'description', content: page.description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
    upsertMeta('meta[name="author"]', { name: 'author', content: data.site.name });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: page.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: page.description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: page.type });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[property="og:image:secure_url"]', { property: 'og:image:secure_url', content: image });
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: page.image.width });
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: page.image.height });
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: page.image.alt });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: page.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: page.description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: page.image.alt });
    if (page.type === 'article') {
      upsertMeta('meta[property="article:section"]', { property: 'article:section', content: page.articleSection });
      upsertMeta('meta[property="article:modified_time"]', { property: 'article:modified_time', content: page.dateModified });
    } else {
      removeMeta('meta[property="article:section"]');
      removeMeta('meta[property="article:modified_time"]');
    }
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: url });
    upsertLink('link[rel="alternate"][hreflang="en-KE"]', { rel: 'alternate', hreflang: 'en-KE', href: url });
    upsertLink('link[rel="alternate"][hreflang="x-default"]', { rel: 'alternate', hreflang: 'x-default', href: url });
    let schema = document.getElementById('structured-data');
    if (!schema) { schema = document.createElement('script'); schema.id = 'structured-data'; schema.type = 'application/ld+json'; document.head.append(schema); }
    schema.textContent = JSON.stringify(data.schemas[path]);
  };
  let refreshTimer;
  const refresh = () => {
    update();
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(update, 80);
  };
  refresh();
  new MutationObserver(refresh).observe(document.getElementById('root'), { childList: true, subtree: true });
  window.addEventListener('popstate', refresh);
  window.addEventListener('forland:routechange', refresh);
  for (const method of ['pushState', 'replaceState']) {
    const native = history[method];
    history[method] = function (...args) {
      const result = native.apply(this, args);
      window.dispatchEvent(new Event('forland:routechange'));
      return result;
    };
  }
  document.addEventListener('click', () => window.setTimeout(refresh, 0), true);
})();\n`;

const breadcrumbRuntime = `(() => {
  const labels = ${breadcrumbJson};
  const root = document.getElementById('root');
  if (!root) return;
  const normalize = () => window.location.pathname.replace(/\\/+$/, '') || '/';
  const trailFor = (path) => {
    const trail = [{ href: '/', label: 'Home' }];
    if (path.startsWith('/practice-areas/')) trail.push({ href: '/practice-areas', label: 'Practice Areas' });
    if (path.startsWith('/insights/')) trail.push({ href: '/insights', label: 'Insights' });
    trail.push({ href: path, label: labels[path] });
    return trail;
  };
  const apply = () => {
    const path = normalize();
    const existing = root.querySelector('.seo-breadcrumb');
    if (path === '/' || !labels[path]) { existing?.remove(); return; }
    if (existing?.dataset.path === path) return;
    existing?.remove();
    const headerSection = root.querySelector('main > section:first-child');
    const target = headerSection?.querySelector('.mx-auto');
    if (!target) return;
    const nav = document.createElement('nav');
    nav.className = 'seo-breadcrumb';
    nav.dataset.path = path;
    nav.setAttribute('aria-label', 'Breadcrumb');
    const list = document.createElement('ol');
    trailFor(path).forEach((item, index, items) => {
      const listItem = document.createElement('li');
      if (index) {
        const separator = document.createElement('span');
        separator.className = 'seo-breadcrumb-separator';
        separator.setAttribute('aria-hidden', 'true');
        separator.textContent = '/';
        listItem.append(separator);
      }
      if (index === items.length - 1) {
        const current = document.createElement('span');
        current.setAttribute('aria-current', 'page');
        current.textContent = item.label;
        listItem.append(current);
      } else {
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.label;
        listItem.append(link);
      }
      list.append(listItem);
    });
    nav.append(list);
    target.prepend(nav);
  };
  let frame;
  const schedule = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(apply);
  };
  schedule();
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  window.addEventListener('popstate', schedule);
  window.addEventListener('forland:routechange', schedule);
  document.addEventListener('click', () => window.setTimeout(schedule, 0), true);
})();\n`;

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');
const urls = Object.entries(pages).map(([path, page]) => {
  const url = `${site.origin}${path === '/' ? '/' : path}`;
  const image = `${site.origin}${page.image.src}`;
  return `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastModified}</lastmod>\n    <image:image>\n      <image:loc>${escapeXml(image)}</image:loc>\n    </image:image>\n  </url>`;
}).join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\nHost: ${new URL(site.origin).hostname}\n`;

await writeFile('public/assets/js/route-meta.js', runtime);
await writeFile('public/assets/js/seo-navigation.js', breadcrumbRuntime);
await writeFile('public/sitemap.xml', sitemap);
await writeFile('public/robots.txt', robots);
console.log(`Generated runtime metadata, structured data and image sitemap for ${Object.keys(pages).length} routes.`);
