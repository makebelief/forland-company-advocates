import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildStructuredData } from './seo-structured-data.mjs';
import { insightPaths, pages, practicePaths, site } from './seo-pages.mjs';

const template = await readFile('dist/index.html', 'utf8');
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');
const absolute = (path) => `${site.origin}${path}`;
const routeUrl = (path) => absolute(path === '/' ? '/' : path);
const mimeType = (path) => path.endsWith('.png') ? 'image/png' : 'image/jpeg';
const displayImage = (path) => path.replace(/\.(?:jpe?g|png)$/i, '.webp');

const upsertMeta = (html, attribute, key, value) => {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key}["'][^>]*>`, 'i');
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
};

const upsertLink = (html, rel, href, extra = '') => {
  const tag = `<link rel="${rel}" href="${escapeHtml(href)}"${extra ? ` ${extra}` : ''} />`;
  const pattern = new RegExp(`<link\\s+rel=["']${rel}["'][^>]*>`, 'i');
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
};

const navLinks = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/practice-areas', 'Practice Areas'],
  ['/insights', 'Insights'],
  ['/our-team', 'Our Team'],
  ['/contact', 'Contact'],
];

const listLinks = (paths) => `<ul>${paths.map((path) => (
  `<li><a href="${path}">${escapeHtml(pages[path].h1)}</a><p>${escapeHtml(pages[path].description)}</p></li>`
)).join('')}</ul>`;

const breadcrumbHtml = (path, page) => {
  if (path === '/') return '';
  const items = [{ href: '/', label: 'Home' }];
  if (path.startsWith('/practice-areas/')) {
    items.push({ href: '/practice-areas', label: 'Practice Areas' });
  } else if (path.startsWith('/insights/')) {
    items.push({ href: '/insights', label: 'Insights' });
  }
  items.push({ href: path, label: page.breadcrumbLabel });
  return `<nav class="seo-fallback-breadcrumb" aria-label="Breadcrumb"><ol>${items.map((item, index) => {
    const current = index === items.length - 1;
    const label = escapeHtml(item.label);
    const content = current ? `<span aria-current="page">${label}</span>` : `<a href="${item.href}">${label}</a>`;
    return `<li>${index ? '<span class="seo-breadcrumb-separator" aria-hidden="true">/</span>' : ''}${content}</li>`;
  }).join('')}</ol></nav>`;
};

const fallbackHtml = (path, page) => {
  const isHome = path === '/';
  const heroEyebrow = page.heroEyebrow || page.eyebrow;
  const heroDescription = page.heroDescription || page.description;
  let discovery = '';
  if (path === '/' || path === '/practice-areas') {
    discovery += `<section aria-labelledby="practice-links"><h2 id="practice-links">Legal services in Kenya</h2>${listLinks(practicePaths)}</section>`;
  }
  if (path === '/' || path === '/insights') {
    discovery += `<section aria-labelledby="insight-links"><h2 id="insight-links">Practical Kenyan legal guides</h2>${listLinks(insightPaths)}</section>`;
  }
  if (path.startsWith('/practice-areas/')) {
    discovery += `<section aria-labelledby="related-links"><h2 id="related-links">Related legal services</h2>${listLinks(practicePaths.filter((itemPath) => itemPath !== path).slice(0, 5))}</section>`;
  }
  if (path.startsWith('/insights/')) {
    if (page.relatedPracticePath) {
      discovery += `<section aria-labelledby="related-practice"><h2 id="related-practice">Related legal service</h2>${listLinks([page.relatedPracticePath])}</section>`;
    }
    discovery += `<section aria-labelledby="related-links"><h2 id="related-links">More Kenyan legal insights</h2>${listLinks(insightPaths.filter((itemPath) => itemPath !== path).slice(0, 5))}</section>`;
  }

  const topics = page.topics.length
    ? `<section aria-labelledby="topic-links"><h2 id="topic-links">What this page covers</h2><ul class="seo-fallback-topics">${page.topics.map((topic) => `<li>${escapeHtml(topic)}</li>`).join('')}</ul></section>`
    : '';

  const heroImage = isHome
    ? `<img class="seo-fallback-hero-image" src="${displayImage(page.image.src)}" width="${page.image.width}" height="${page.image.height}" alt="${escapeHtml(page.image.alt)}" decoding="async" fetchpriority="high" />`
    : '';
  const contentImage = isHome
    ? ''
    : `<img src="${displayImage(page.image.src)}" width="${page.image.width}" height="${page.image.height}" alt="${escapeHtml(page.image.alt)}" decoding="async" loading="lazy" />`;

  return `<div class="seo-fallback-shell ${isHome ? 'is-home' : 'is-inner'}">
    <a class="seo-fallback-skip" href="#main-content">Skip to main content</a>
    <header class="seo-fallback-header">
      <div class="seo-fallback-header-inner">
        <a class="seo-fallback-brand" href="/">Forland &amp; Company Advocates</a>
        <div class="seo-fallback-header-nav">
          <nav aria-label="Primary navigation"><ul>${navLinks.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul></nav>
          <a class="seo-fallback-header-cta" href="/contact">Talk to an Advocate</a>
        </div>
        <span class="seo-fallback-mobile-menu" aria-hidden="true">☰</span>
      </div>
    </header>
    <main class="seo-fallback-main" id="main-content">
      <section class="seo-fallback-hero" aria-labelledby="seo-fallback-heading">
        ${heroImage}
        <div class="seo-fallback-hero-overlay" aria-hidden="true"></div>
        <div class="seo-fallback-hero-content">
          ${breadcrumbHtml(path, page)}
          <p class="seo-fallback-eyebrow">${escapeHtml(heroEyebrow)}</p>
          <h1 id="seo-fallback-heading">${escapeHtml(page.h1)}</h1>
          <p class="seo-fallback-intro">${escapeHtml(heroDescription)}</p>
          <div class="seo-fallback-actions">
            <a class="seo-fallback-action primary" href="/contact">Talk to an Advocate&nbsp; →</a>
            <a class="seo-fallback-action" href="/practice-areas">Our Practice Areas&nbsp; →</a>
          </div>
          ${isHome ? '<p class="seo-fallback-scroll">Scroll</p>' : ''}
        </div>
      </section>
      <article class="seo-fallback-content">
        ${contentImage}
        ${topics}
        ${discovery}
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading">Discuss your legal matter</h2>
          <p>Forland &amp; Company Advocates advises businesses, investors and individuals from its office in Nairobi, Kenya.</p>
          <p><a href="/contact">Contact the firm</a> to arrange a discussion about your objectives.</p>
        </section>
      </article>
    </main>
    <footer class="seo-fallback-footer"><p>Forland &amp; Company Advocates · Nairobi, Kenya</p><p><a href="/privacy-policy">Privacy Policy</a> · <a href="/terms-of-use">Terms of Use</a></p></footer>
  </div>`;
};

for (const [path, page] of Object.entries(pages)) {
  const url = routeUrl(path);
  const imageUrl = absolute(page.image.src);
  const schema = JSON.stringify(buildStructuredData(path, page)).replaceAll('<', '\\u003c');
  let html = template
    .replace(/<html\s+lang=["'][^"']+["']>/i, `<html lang="${site.locale}">`)
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<div id="root"><\/div>/, `<div id="root">${fallbackHtml(path, page)}</div>`);

  html = upsertMeta(html, 'name', 'description', page.description);
  html = upsertMeta(html, 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  html = upsertMeta(html, 'name', 'author', site.name);
  html = upsertMeta(html, 'name', 'application-name', site.name);
  html = upsertMeta(html, 'property', 'og:type', page.type);
  html = upsertMeta(html, 'property', 'og:title', page.title);
  html = upsertMeta(html, 'property', 'og:description', page.description);
  html = upsertMeta(html, 'property', 'og:url', url);
  html = upsertMeta(html, 'property', 'og:site_name', site.name);
  html = upsertMeta(html, 'property', 'og:locale', site.locale.replace('-', '_'));
  html = upsertMeta(html, 'property', 'og:image', imageUrl);
  html = upsertMeta(html, 'property', 'og:image:secure_url', imageUrl);
  html = upsertMeta(html, 'property', 'og:image:type', mimeType(page.image.src));
  html = upsertMeta(html, 'property', 'og:image:width', page.image.width);
  html = upsertMeta(html, 'property', 'og:image:height', page.image.height);
  html = upsertMeta(html, 'property', 'og:image:alt', page.image.alt);
  html = upsertMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = upsertMeta(html, 'name', 'twitter:title', page.title);
  html = upsertMeta(html, 'name', 'twitter:description', page.description);
  html = upsertMeta(html, 'name', 'twitter:image', imageUrl);
  html = upsertMeta(html, 'name', 'twitter:image:alt', page.image.alt);
  html = upsertLink(html, 'canonical', url);
  html = upsertLink(html, 'alternate', url, `hreflang="${site.locale}"`);
  html = html.replace('</head>', `    <link rel="alternate" hreflang="x-default" href="${url}" />\n  </head>`);

  if (page.type === 'article') {
    html = upsertMeta(html, 'property', 'article:section', page.articleSection);
    html = upsertMeta(html, 'property', 'article:modified_time', page.dateModified);
  }
  if (path === '/') {
    const preloadImage = '/assets/media/hero-poster-nairobi.webp';
    html = html.replace('</head>', `    <link rel="preload" as="image" href="${preloadImage}" fetchpriority="high" />\n  </head>`);
  }

  html = html.replace('</head>', `    <script id="structured-data" type="application/ld+json">${schema}</script>\n  </head>`);
  if (path === '/') {
    await writeFile('dist/index.html', html);
  } else {
    const directory = `dist${path}`;
    await mkdir(directory, { recursive: true });
    await writeFile(`${directory}/index.html`, html);
  }
}

console.log(`Generated crawlable HTML, metadata and structured data for ${Object.keys(pages).length} routes.`);
