(() => {
  const labels = {"/":"Law Firm in Nairobi, Kenya","/about":"About the Firm","/practice-areas":"Practice Areas","/practice-areas/corporate-commercial":"Corporate & Commercial","/practice-areas/litigation-dispute":"Litigation & Dispute Resolution","/practice-areas/real-estate":"Real Estate & Conveyancing","/practice-areas/employment-labour":"Employment & Labour","/practice-areas/banking-finance":"Banking & Finance","/practice-areas/technology-data-ip":"Technology, Data & IP","/practice-areas/immigration-mobility":"Immigration & Business Mobility","/practice-areas/estate-planning":"Succession & Estate Planning","/practice-areas/construction-projects":"Construction & Infrastructure","/practice-areas/energy-emobility":"Energy & E-Mobility","/insights":"Legal Insights","/insights/establishing-business":"Corporate Law Guide","/insights/commercial-agreement":"Commercial Law Guide","/insights/emobility-sector":"Energy & E-Mobility Guide","/insights/corporate-governance":"Corporate Governance Guide","/insights/property-due-diligence":"Real Estate Guide","/insights/employment-compliance":"Employment Law Guide","/our-team":"Our Legal Team","/contact":"Contact","/privacy-policy":"Privacy Policy","/terms-of-use":"Terms of Use"};
  const root = document.getElementById('root');
  if (!root) return;
  const normalize = () => window.location.pathname.replace(/\/+$/, '') || '/';
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
})();
