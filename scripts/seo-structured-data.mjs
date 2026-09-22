import { insightPaths, pages, practicePaths, site } from './seo-pages.mjs';

const absolute = (path) => `${site.origin}${path}`;
const pageUrl = (path) => absolute(path === '/' ? '/' : path);
const pageName = (path) => pages[path]?.h1 ?? path;

const organizationId = `${site.origin}/#organization`;
const websiteId = `${site.origin}/#website`;

const practiceTopics = practicePaths.flatMap((path) => pages[path].topics);

const organization = {
  '@type': ['LegalService', 'ProfessionalService', 'Organization'],
  '@id': organizationId,
  name: site.name,
  legalName: site.name,
  alternateName: site.shortName,
  description: site.description,
  url: `${site.origin}/`,
  logo: {
    '@type': 'ImageObject',
    url: absolute(site.logo.src),
    contentUrl: absolute(site.logo.src),
    width: site.logo.width,
    height: site.logo.height,
  },
  email: site.email,
  telephone: site.telephone,
  address: {
    '@type': 'PostalAddress',
    ...site.address,
  },
  areaServed: {
    '@type': 'Country',
    name: 'Kenya',
  },
  availableLanguage: {
    '@type': 'Language',
    name: 'English',
    alternateName: 'en',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'client enquiries',
    telephone: site.telephone,
    email: site.email,
    areaServed: 'KE',
    availableLanguage: ['English'],
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: site.openingHours.days.map((day) => `https://schema.org/${day}`),
    opens: site.openingHours.opens,
    closes: site.openingHours.closes,
  },
  knowsAbout: [...new Set(practiceTopics)],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Legal Services in Kenya',
    itemListElement: practicePaths.map((path, index) => ({
      '@type': 'Offer',
      position: index + 1,
      itemOffered: {
        '@type': 'Service',
        name: pages[path].h1,
        url: pageUrl(path),
      },
    })),
  },
};

const website = {
  '@type': 'WebSite',
  '@id': websiteId,
  url: `${site.origin}/`,
  name: site.name,
  alternateName: site.shortName,
  description: site.description,
  publisher: { '@id': organizationId },
  inLanguage: site.locale,
};

const breadcrumbItems = (path) => {
  const items = [{ name: 'Home', url: `${site.origin}/` }];
  if (path.startsWith('/practice-areas/')) {
    items.push({ name: 'Practice Areas', url: pageUrl('/practice-areas') });
  } else if (path.startsWith('/insights/')) {
    items.push({ name: 'Legal Insights', url: pageUrl('/insights') });
  }
  if (path !== '/') items.push({ name: pageName(path), url: pageUrl(path) });
  return items;
};

const itemList = (path, paths, name) => ({
  '@type': 'ItemList',
  '@id': `${pageUrl(path)}#items`,
  name,
  numberOfItems: paths.length,
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  itemListElement: paths.map((itemPath, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: pageName(itemPath),
    url: pageUrl(itemPath),
  })),
});

export const buildStructuredData = (path, page = pages[path]) => {
  const url = pageUrl(path);
  const imageUrl = absolute(page.image.src);
  const webpageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
  const graph = [organization, website];

  const webpage = {
    '@type': page.schemaType,
    '@id': webpageId,
    url,
    name: page.title,
    headline: page.h1,
    description: page.description,
    isPartOf: { '@id': websiteId },
    about: { '@id': organizationId },
    publisher: { '@id': organizationId },
    inLanguage: site.locale,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: imageUrl,
      contentUrl: imageUrl,
      width: page.image.width,
      height: page.image.height,
      caption: page.image.alt,
    },
  };

  if (path !== '/') webpage.breadcrumb = { '@id': breadcrumbId };
  if (page.dateModified) webpage.dateModified = page.dateModified;
  graph.push(webpage);

  if (path.startsWith('/practice-areas/')) {
    const service = {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.h1,
      description: page.description,
      url,
      serviceType: page.topics,
      provider: { '@id': organizationId },
      areaServed: { '@type': 'Country', name: 'Kenya' },
      mainEntityOfPage: { '@id': webpageId },
    };
    graph.push(service);
    webpage.mainEntity = { '@id': service['@id'] };
  }

  if (page.type === 'article') {
    const article = {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: page.h1,
      description: page.description,
      url,
      mainEntityOfPage: { '@id': webpageId },
      author: { '@id': organizationId },
      publisher: { '@id': organizationId },
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
        width: page.image.width,
        height: page.image.height,
      },
      articleSection: page.articleSection,
      keywords: page.topics.join(', '),
      inLanguage: site.locale,
      isAccessibleForFree: true,
      dateModified: page.dateModified,
    };
    graph.push(article);
    webpage.mainEntity = { '@id': article['@id'] };
  }

  if (path === '/practice-areas') {
    const list = itemList(path, practicePaths, 'Legal Practice Areas');
    graph.push(list);
    webpage.mainEntity = { '@id': list['@id'] };
  }

  if (path === '/insights') {
    const list = itemList(path, insightPaths, 'Kenya Legal Insights');
    graph.push(list);
    webpage.mainEntity = { '@id': list['@id'] };
  }

  if (path === '/our-team') {
    const person = {
      '@type': 'Person',
      '@id': `${site.origin}/our-team#asbjorn-ngani`,
      name: 'Asbjorn Ng’ani',
      jobTitle: 'Managing Partner and Advocate of the High Court of Kenya',
      url,
      worksFor: { '@id': organizationId },
      knowsAbout: page.topics,
    };
    graph.push(person);
    webpage.mainEntity = { '@id': person['@id'] };
  }

  if (path === '/about' || path === '/contact') {
    webpage.mainEntity = { '@id': organizationId };
  }

  if (path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: breadcrumbItems(path).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
};
