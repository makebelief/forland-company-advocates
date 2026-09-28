(() => {
  const practices = {
    'corporate-commercial': {
      src: '/assets/media/client-practice/corporate-commercial.webp',
      alt: 'Nairobi city centre and commercial buildings',
      title: 'Corporate & Commercial Law',
    },
    'litigation-dispute': {
      src: '/assets/media/client-practice/litigation-dispute.webp',
      alt: 'Supreme Court of Kenya building in Nairobi',
      title: 'Litigation & Dispute Resolution',
    },
    'real-estate': {
      src: '/assets/media/client-practice/real-estate.webp',
      alt: 'Model home and keys representing a property transaction',
      title: 'Real Estate & Conveyancing',
    },
    'employment-labour': {
      src: '/assets/media/client-practice/employment-labour.webp',
      alt: 'Professionals reviewing an employment agreement',
      title: 'Employment & Labour Law',
    },
    'banking-finance': {
      src: '/assets/media/client-practice/banking-finance.webp',
      alt: 'Person using a bank cash machine',
      title: 'Banking & Finance',
    },
    'technology-data-ip': {
      src: '/assets/media/client-practice/technology-data-protection.webp',
      alt: 'Combination lock and payment cards representing data security',
      title: 'Technology, Data Protection & Intellectual Property',
    },
    'immigration-mobility': {
      src: '/assets/media/client-practice/immigration-mobility.webp',
      alt: 'Passport and visa stamps representing international mobility',
      title: 'Immigration & Business Mobility',
    },
    'estate-planning': {
      src: '/assets/media/client-practice/family-succession-estate-planning.webp',
      alt: 'Will, estate inventory and house keys',
      title: 'Family, Succession & Estate Planning',
    },
    'construction-projects': {
      src: '/assets/media/client-practice/construction-projects.webp',
      alt: 'Excavators working on a major construction site',
      title: 'Construction, Infrastructure & Projects',
    },
    'energy-emobility': {
      src: '/assets/media/client-practice/electric-mobility.webp',
      alt: 'Electric vehicle connected to a charging point',
      title: 'Electric Mobility, Clean Energy & Sustainable Transport',
    },
  };

  let scheduled = false;

  function enhance() {
    if (location.pathname.replace(/\/+$/, '') !== '/practice-areas') return;

    Object.entries(practices).forEach(([slug, practice]) => {
      const section = document.getElementById(slug);
      if (!section || section.querySelector('[data-practice-overview-image]')) return;

      const layout = section.firstElementChild?.firstElementChild?.firstElementChild;
      const introduction = layout?.firstElementChild;
      if (!introduction) return;

      const detailLink = introduction.querySelector(`a[href="/practice-areas/${slug}"]`);
      const action = detailLink?.closest('.reveal') || detailLink?.parentElement;
      const figure = document.createElement('figure');
      figure.className = 'practice-overview-image';
      figure.dataset.practiceOverviewImage = slug;

      const link = document.createElement('a');
      link.href = `/practice-areas/${slug}`;
      link.setAttribute('aria-label', `View ${practice.title}`);

      const image = document.createElement('img');
      image.src = practice.src;
      image.alt = practice.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      link.append(image);
      figure.append(link);
      introduction.insertBefore(figure, action || null);
    });
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhance();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();

  new MutationObserver(schedule).observe(document.getElementById('root') || document.body, {
    childList: true,
    subtree: true,
  });
  addEventListener('popstate', schedule);
})();
