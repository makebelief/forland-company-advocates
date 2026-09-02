import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pages, site, lastModified } from './seo-pages.mjs';

const template = await readFile('dist/index.html', 'utf8');
const esc = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const organization = {
  '@context': 'https://schema.org',
  '@type': ['LegalService', 'ProfessionalService'],
  '@id': `${site.origin}/#organization`,
  name: site.name,
  alternateName: site.shortName,
  url: `${site.origin}/`,
  logo: `${site.origin}${site.logo}`,
  image: `${site.origin}${site.image}`,
  email: site.email,
  telephone: site.telephone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '4th Floor, Left Wing, Landmark Plaza, Argwings Kodhek Road',
    addressLocality: 'Nairobi',
    addressCountry: 'KE',
  },
  areaServed: { '@type': 'Country', name: 'Kenya' },
};

for (const [path, page] of Object.entries(pages)) {
  const url = site.origin + (path === '/' ? '/' : path);
  const graph = [{
    '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title,
    description: page.description, isPartOf: { '@id': `${site.origin}/#website` },
    about: { '@id': `${site.origin}/#organization` }, inLanguage: 'en-KE',
  }];
  if (path === '/') {
    graph.push(organization, {
      '@type': 'WebSite', '@id': `${site.origin}/#website`, url: `${site.origin}/`,
      name: site.name, alternateName: site.shortName, publisher: { '@id': `${site.origin}/#organization` }, inLanguage: 'en-KE',
    });
  }
  if (path.startsWith('/practice-areas/')) {
    graph.push({ '@type': 'Service', name: page.title.split(' | ')[0], description: page.description, provider: { '@id': `${site.origin}/#organization` }, areaServed: 'Kenya', url });
  }
  if (page.type === 'article') {
    graph.push({ '@type': 'Article', headline: page.title.split(' | ')[0], description: page.description, mainEntityOfPage: url, dateModified: lastModified, author: { '@id': `${site.origin}/#organization` }, publisher: { '@id': `${site.origin}/#organization` }, image: `${site.origin}${site.image}` });
  }
  if (path !== '/') {
    const segments = path.split('/').filter(Boolean);
    const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${site.origin}/` }];
    segments.forEach((segment, index) => {
      const itemPath = '/' + segments.slice(0, index + 1).join('/');
      items.push({ '@type': 'ListItem', position: index + 2, name: index === segments.length - 1 ? page.title.split(' | ')[0] : segment.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()), item: site.origin + itemPath });
    });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: items });
  }
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c');
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${esc(page.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(page.description)}" />`)
    .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />')
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${page.type}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(page.title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(page.description)}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(page.title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(page.description)}" />`)
    .replace('</head>', `    <script type="application/ld+json">${schema}</script>\n  </head>`);
  if (path === '/') await writeFile('dist/index.html', html);
  else { const directory = `dist${path}`; await mkdir(directory, { recursive: true }); await writeFile(`${directory}/index.html`, html); }
}
console.log(`Generated crawlable HTML metadata for ${Object.keys(pages).length} routes.`);
