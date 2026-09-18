import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pages, site, lastModified } from './seo-pages.mjs';

const template = await readFile('dist/index.html', 'utf8');
const esc = (value = '') => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const person = {
  '@type': 'Person',
  '@id': `${site.origin}/our-team#asbjorn-ngani`,
  name: 'Asbjorn Ng’ani',
  jobTitle: 'Managing Partner | Advocate of the High Court of Kenya',
  worksFor: { '@id': `${site.origin}/#organization` },
  url: `${site.origin}/our-team`,
  knowsAbout: [
    'Corporate and Commercial Law', 'Litigation and Dispute Resolution', 'Real Estate and Conveyancing',
    'Employment and Labour Law', 'Banking and Finance', 'Technology and Data Protection',
    'Immigration and Business Mobility', 'Succession and Estate Planning', 'Construction and Infrastructure',
    'Electric Mobility and Clean Energy',
  ],
};

const organization = {
  '@type': ['LegalService', 'ProfessionalService', 'Organization'],
  '@id': `${site.origin}/#organization`,
  name: site.name,
  alternateName: site.shortName,
  url: `${site.origin}/`,
  logo: {
    '@type': 'ImageObject',
    '@id': `${site.origin}/#logo`,
    url: `${site.origin}${site.logo}`,
    contentUrl: `${site.origin}${site.logo}`,
    caption: site.name,
  },
  image: `${site.origin}${site.image}`,
  email: site.email,
  telephone: site.telephone,
  address: { '@type': 'PostalAddress', ...site.address },
  areaServed: { '@type': 'Country', name: 'Kenya' },
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'legal enquiries', telephone: site.telephone, email: site.email, areaServed: 'KE', availableLanguage: ['English', 'Swahili'] },
    { '@type': 'ContactPoint', contactType: 'telephone enquiries', telephone: site.secondaryTelephone, areaServed: 'KE', availableLanguage: ['English', 'Swahili'] },
  ],
  knowsAbout: person.knowsAbout,
  employee: { '@id': person['@id'] },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Legal Services',
    itemListElement: Object.entries(pages)
      .filter(([path, page]) => path.startsWith('/practice-areas/') && page.serviceType)
      .map(([path, page]) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: page.serviceType,
          url: `${site.origin}${path}`,
          provider: { '@id': `${site.origin}/#organization` },
          areaServed: { '@type': 'Country', name: 'Kenya' },
        },
      })),
  },
};

const website = {
  '@type': 'WebSite',
  '@id': `${site.origin}/#website`,
  url: `${site.origin}/`,
  name: site.name,
  alternateName: site.shortName,
  publisher: { '@id': `${site.origin}/#organization` },
  inLanguage: 'en-KE',
};

const breadcrumbFor = (path, page) => {
  if (path === '/') return null;
  const segments = path.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${site.origin}/` }];
  const parentLabels = { 'practice-areas': 'Practice Areas', insights: 'Insights', 'our-team': 'Our Team' };
  segments.forEach((segment, index) => {
    const itemPath = '/' + segments.slice(0, index + 1).join('/');
    const name = index === segments.length - 1
      ? page.title.split(' | ')[0]
      : (parentLabels[segment] || segment.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
    items.push({ '@type': 'ListItem', position: index + 2, name, item: site.origin + itemPath });
  });
  return { '@type': 'BreadcrumbList', '@id': `${site.origin}${path}#breadcrumb`, itemListElement: items };
};

for (const [path, page] of Object.entries(pages)) {
  const url = site.origin + (path === '/' ? '/' : path);
  const image = `${site.origin}${page.image}`;
  const pageId = `${url}#webpage`;
  const graph = [organization, website, person];

  const pageNode = {
    '@type': page.schemaType || 'WebPage',
    '@id': pageId,
    url,
    name: page.title,
    description: page.description,
    isPartOf: { '@id': `${site.origin}/#website` },
    about: { '@id': `${site.origin}/#organization` },
    primaryImageOfPage: { '@type': 'ImageObject', url: image, caption: page.imageAlt },
    inLanguage: 'en-KE',
    dateModified: lastModified,
  };

  if (path.startsWith('/practice-areas/') && page.serviceType) {
    const serviceId = `${url}#service`;
    pageNode.mainEntity = { '@id': serviceId };
    graph.push({
      '@type': 'Service',
      '@id': serviceId,
      name: page.serviceType,
      serviceType: page.serviceType,
      description: page.description,
      provider: { '@id': `${site.origin}/#organization` },
      areaServed: { '@type': 'Country', name: 'Kenya' },
      url,
      image,
    });
  }

  if (page.type === 'article') {
    const articleId = `${url}#article`;
    pageNode.mainEntity = { '@id': articleId };
    graph.push({
      '@type': 'Article',
      '@id': articleId,
      headline: page.title.split(' | ')[0],
      description: page.description,
      mainEntityOfPage: { '@id': pageId },
      datePublished: page.datePublished || lastModified,
      dateModified: lastModified,
      author: { '@id': `${site.origin}/#organization` },
      publisher: { '@id': `${site.origin}/#organization` },
      image: [image],
      inLanguage: 'en-KE',
    });
  }

  if (path === '/our-team') pageNode.mainEntity = { '@id': person['@id'] };
  graph.push(pageNode);
  const breadcrumb = breadcrumbFor(path, page);
  if (breadcrumb) graph.push(breadcrumb);

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
    .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta property="og:image:alt"[^>]*>/, `<meta property="og:image:alt" content="${esc(page.imageAlt)}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(page.title)}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(page.description)}" />`)
    .replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${image}" />`)
    .replace('</head>', `    <meta name="author" content="${esc(site.name)}" />\n    <meta name="twitter:image:alt" content="${esc(page.imageAlt)}" />\n    <link rel="alternate" hreflang="en-KE" href="${url}" />\n    <link rel="alternate" hreflang="x-default" href="${url}" />\n    <script type="application/ld+json">${schema}</script>\n  </head>`);

  if (page.type === 'article') {
    html = html.replace('</head>', `    <meta property="article:published_time" content="${page.datePublished || lastModified}" />\n    <meta property="article:modified_time" content="${lastModified}" />\n  </head>`);
  }

  if (path === '/') await writeFile('dist/index.html', html);
  else {
    const directory = `dist${path}`;
    await mkdir(directory, { recursive: true });
    await writeFile(`${directory}/index.html`, html);
  }
}
console.log(`Generated crawlable metadata and structured data for ${Object.keys(pages).length} routes.`);
