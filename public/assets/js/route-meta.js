(() => {
  const pages = {
    '/': {
      title: 'Forland & Company Advocates | Commercial Law Firm Nairobi Kenya',
      description: 'Practical corporate, commercial and investment legal solutions for businesses, investors and entrepreneurs in Kenya.',
    },
    '/about': {
      title: 'About | Forland & Company Advocates',
      description: 'Learn about Forland & Company Advocates and our practical, commercially focused approach to legal services in Kenya.',
    },
    '/practice-areas': {
      title: 'Practice Areas | Forland & Company Advocates',
      description: 'Explore corporate, commercial, dispute resolution, property, employment, finance, immigration and energy legal services.',
    },
    '/insights': {
      title: 'Legal Insights | Forland & Company Advocates',
      description: 'Practical legal and commercial perspectives for businesses, investors and entrepreneurs operating in Kenya.',
    },
    '/contact': {
      title: 'Contact | Forland & Company Advocates',
      description: 'Send a secure inquiry to Forland & Company Advocates in Nairobi, Kenya.',
    },
    '/privacy-policy': {
      title: 'Privacy Policy | Forland & Company Advocates',
      description: 'How Forland & Company Advocates handles information submitted through this website.',
    },
    '/terms-of-use': {
      title: 'Terms of Use | Forland & Company Advocates',
      description: 'Terms governing the use of the Forland & Company Advocates website.',
    },
  };

  let previousPath = '';
  const updateMetadata = () => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path === previousPath) return;
    previousPath = path;

    const page = pages[path] ?? {
      title: 'Page Not Found | Forland & Company Advocates',
      description: 'The requested page could not be found.',
    };
    document.title = page.title;

    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = page.description;

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = `https://forlandcompanyadvocates.co.ke${path === '/' ? '/' : path}`;
  };

  updateMetadata();
  new MutationObserver(updateMetadata).observe(document.getElementById('root'), {
    childList: true,
    subtree: true,
  });
  window.addEventListener('popstate', updateMetadata);
  document.addEventListener('click', () => window.setTimeout(updateMetadata, 0), true);
})();
