(() => {
  let cms = null;
  let scheduled = false;
  let managedMode = false;
  const preservedCompiledRoutes = new Set([
    '/practice-areas',
    '/practice-areas/corporate-commercial',
    '/practice-areas/litigation-dispute',
    '/practice-areas/real-estate',
    '/practice-areas/employment-labour',
    '/practice-areas/banking-finance',
    '/practice-areas/technology-data-ip',
    '/practice-areas/immigration-mobility',
    '/practice-areas/estate-planning',
    '/practice-areas/construction-projects',
    '/practice-areas/energy-emobility',
    '/our-team',
    '/insights',
    '/insights/establishing-business',
    '/insights/commercial-agreement',
    '/insights/emobility-sector',
    '/insights/corporate-governance',
    '/insights/property-due-diligence',
    '/insights/employment-compliance',
  ]);

  const el = (tag, cls='', text='') => { const n=document.createElement(tag); if(cls)n.className=cls; if(text)n.textContent=text; return n; };
  const findPage = (slug) => cms?.pages?.find((x) => x.slug === slug && x.is_published !== false);
  const setMeta = (title, description, image='', { noindex=false, type='website' }={}) => {
    if (title) document.title = title;
    const set = (selector, attr, value) => { if(!value)return; const node=document.querySelector(selector); if(node)node.setAttribute(attr,value); };
    const canonical = location.origin + (location.pathname.replace(/\/+$/,'') || '/');
    set('meta[name="description"]','content',description); set('meta[name="robots"]','content',noindex?'noindex, follow':'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'); set('link[rel="canonical"]','href',canonical); set('meta[property="og:type"]','content',type); set('meta[property="og:url"]','content',canonical); set('meta[property="og:title"]','content',title); set('meta[property="og:description"]','content',description); set('meta[name="twitter:title"]','content',title); set('meta[name="twitter:description"]','content',description); if(image){set('meta[property="og:image"]','content',image);set('meta[name="twitter:image"]','content',image);}
  };
  const absoluteImage = (value) => !value ? '' : value.startsWith('/') ? `${location.origin}${value}` : value;
  function addImage(parent,src,alt='',className=''){if(!src)return null;const img=el('img',className);img.src=src;img.alt=alt;img.addEventListener('error',()=>img.remove(),{once:true});parent.append(img);return img;}
  const escapeMarkup=(value)=>String(value||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const inlineMarkup=(value)=>escapeMarkup(value).replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+|\/[^)\s]+)\)/g,'<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/_([^_]+)_/g,'<em>$1</em>');
  function formattedMarkup(value){const out=[];let list='';const close=()=>{if(list)out.push(`</${list}>`);list='';};for(const raw of String(value||'').split(/\r?\n/)){const line=raw.trim();if(!line){close();continue;}const heading=line.match(/^(#{2,3})\s+(.+)$/);if(heading){close();const level=heading[1].length;out.push(`<h${level}>${inlineMarkup(heading[2])}</h${level}>`);continue;}const bullet=line.match(/^[-*]\s+(.+)$/),numbered=line.match(/^\d+[.)]\s+(.+)$/);if(bullet||numbered){const next=bullet?'ul':'ol';if(list!==next){close();list=next;out.push(`<${list}>`);}out.push(`<li>${inlineMarkup((bullet||numbered)[1])}</li>`);continue;}close();out.push(`<p>${inlineMarkup(line)}</p>`);}close();return out.join('');}
  function appendTextBlocks(parent,value){const template=document.createElement('template');template.innerHTML=formattedMarkup(value);parent.append(template.content);}

  function replaceExact(oldText,newText){ if(!oldText||!newText||oldText===newText)return; const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); const nodes=[]; while(walker.nextNode()) if(walker.currentNode.nodeValue?.trim()===oldText)nodes.push(walker.currentNode); nodes.forEach(n=>{n.nodeValue=n.nodeValue.replace(oldText,newText);}); }
  function applyGlobalText(){ const site=cms?.settings?.site||{}; replaceExact('Practical Legal Solutions for Business, Investment & Growth',site.hero_title); replaceExact('A Kenyan law firm delivering practical, timely and client-focused legal solutions to businesses, investors and individuals.',site.hero_subtitle); replaceExact('TALK TO AN ADVOCATE',site.primary_cta); replaceExact('OUR PRACTICE AREAS',site.secondary_cta); replaceExact('Nairobi, Kenya',site.location); replaceExact('Office details provided when appointments are confirmed',site.office_address); replaceExact('Available on request',site.phone); replaceExact('Use the secure inquiry form',site.email); replaceExact('Monday–Friday, by appointment',site.office_hours); replaceExact('Let’s Move Your Matter Forward.',site.contact_heading); replaceExact('Whether you are building a business, entering a transaction, investing in Kenya or resolving a dispute, we are ready to help.',site.contact_subtitle); }
  const phoneHref=(value)=>{const clean=String(value||'').replace(/[^\d+]/g,'');return clean?`tel:${clean}`:'';};
  const whatsappHref=(value)=>{const clean=String(value||'').replace(/\D/g,'');return clean?`https://wa.me/${clean}`:'';};
  function applyContactDetails(){
    const site=cms?.settings?.site||{};
    if(site.phone)document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.href=phoneHref(site.phone));
    if(site.email)document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.href=`mailto:${site.email}`);
    if(site.whatsapp)document.querySelectorAll('a[href*="wa.me/"],a[href*="whatsapp.com/"]').forEach(a=>a.href=whatsappHref(site.whatsapp));
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script=>{try{const data=JSON.parse(script.textContent);const nodes=Array.isArray(data?.['@graph'])?data['@graph']:[data];for(const node of nodes){const types=Array.isArray(node?.['@type'])?node['@type']:[node?.['@type']];if(!types.some(type=>['LegalService','ProfessionalService','Organization','LocalBusiness'].includes(type)))continue;if(site.phone)node.telephone=site.phone;if(site.email)node.email=site.email;if(site.office_address)node.address={'@type':'PostalAddress',streetAddress:site.office_address,addressLocality:site.location||'Nairobi',addressCountry:'KE'};if(site.office_hours)node.openingHours=site.office_hours;if(node.contactPoint){if(site.phone)node.contactPoint.telephone=site.phone;if(site.email)node.contactPoint.email=site.email;}}const next=JSON.stringify(data);if(script.textContent!==next)script.textContent=next;}catch{/* Ignore unrelated or invalid third-party data. */}});
  }


  function hero(title,subtitle,kicker,image){ const sec=el('section',`cms-hero${image?' has-image':''}`); if(image){addImage(sec,image,'','cms-hero-bg');sec.append(el('div','cms-hero-shade'));} const wrap=el('div','cms-wrap');wrap.append(el('p','cms-kicker',kicker),el('h1','',title));if(subtitle)wrap.append(el('p','',subtitle));sec.append(wrap);return sec; }
  function managedMain(){ const main=document.querySelector('main'); if(!main)return null; managedMode=true; main.className='cms-managed'; main.textContent=''; main.dataset.cmsRoute=location.pathname.replace(/\/+$/,'')||'/'; return main; }
  function renderNotFound(){const main=managedMain();if(!main)return;main.append(hero('Page not found','The requested page is not currently available.','Error 404',''));const section=el('section','cms-content');const wrap=el('div','cms-wrap');const link=el('a','cms-cta','Return to the home page');link.href='/';wrap.append(link);section.append(wrap);main.append(section);setMeta('Page not found | Forland & Company Advocates','The requested page is not available.','',{noindex:true});}

  function renderPracticeDetail(slug){ const item=cms.practiceAreas?.find(x=>x.slug===slug&&x.is_published); if(!item)return false; const main=managedMain();if(!main)return false;main.append(hero(item.title,item.summary,'Practice Area',item.image_url));const content=el('section','cms-content');const wrap=el('div','cms-wrap cms-prose');const article=el('article');const h=el('h2','',item.title);article.append(h);appendTextBlocks(article,item.body||item.summary);const side=el('aside','cms-side');side.append(el('h2','','How we can help'));const ul=el('ul','cms-services');(Array.isArray(item.services)?item.services:[]).forEach(s=>ul.append(el('li','',s)));side.append(ul);if(item.cta){const a=el('a','cms-cta',item.cta);a.href='/contact';side.append(a);}wrap.append(article,side);content.append(wrap);main.append(content);setMeta(item.seo_title||`${item.title} | Forland & Company Advocates`,item.meta_description||item.summary,absoluteImage(item.image_url));return true; }

  function renderInsightDetail(slug){const item=cms.insights?.find(x=>x.slug===slug&&x.is_published);if(!item)return false;const main=managedMain();if(!main)return false;main.append(hero(item.title,item.excerpt,item.category||'Insights',item.featured_image_url));const sec=el('section','cms-content');const wrap=el('div','cms-wrap cms-prose');const article=el('article');if(item.published_at)article.append(el('p','cms-meta',new Date(item.published_at).toLocaleDateString('en-KE',{year:'numeric',month:'long',day:'numeric'})));appendTextBlocks(article,item.body||item.excerpt);const side=el('aside','cms-side');side.append(el('h2','','About this insight'),el('p','',`Author: ${item.author||'Forland & Company Advocates'}`));const related=cms.practiceAreas?.find(x=>x.id===item.related_practice_area_id&&x.is_published);if(related){side.append(el('h2','','Related legal service'));const relatedLink=el('a','',related.title);relatedLink.href=`/practice-areas/${related.slug}`;side.append(relatedLink);}const contact=el('a','cms-cta','Talk to an Advocate');contact.href='/contact';side.append(contact);wrap.append(article,side);sec.append(wrap);main.append(sec);setMeta(item.seo_title||`${item.title} | Forland & Company Advocates`,item.meta_description||item.excerpt,absoluteImage(item.featured_image_url),{type:'article'});return true;}

  function applyPageText(slug){const page=findPage(slug);if(!page)return false;const c=page.content||{};const selectors=slug==='about'?['A Modern Kenyan Law Firm']:slug==='contact'?['Let’s Move Your Matter Forward.']:slug==='home'?['Practical Legal Solutions for Business, Investment & Growth']:[];selectors.forEach(old=>replaceExact(old,c.heading)); if(slug==='home') replaceExact('A Kenyan law firm delivering practical, timely and client-focused legal solutions to businesses, investors and individuals.',c.intro); if(slug==='about') replaceExact('Forland & Company Advocates delivers practical, timely and client-focused legal solutions to businesses, investors, entrepreneurs, institutions and individuals.',c.intro);if(slug==='contact') replaceExact('Whether you are building a business, entering a transaction, investing in Kenya or resolving a dispute, we are ready to help.',c.intro);setMeta(page.seo_title,page.meta_description,absoluteImage(page.og_image_url));return true;}

  function updateHardcodedCards(){(cms.practiceAreas||[]).forEach(item=>{document.querySelectorAll(`a[href="/practice-areas/${CSS.escape(item.slug)}"]`).forEach(a=>{const card=a.closest('article,div')||a;const heading=card.querySelector('h2,h3,h4');if(heading)heading.textContent=item.title;const p=card.querySelector('p');if(p&&item.summary)p.textContent=item.summary;if(!item.is_published)a.style.display='none';});});(cms.insights||[]).forEach(item=>{document.querySelectorAll(`a[href="/insights/${CSS.escape(item.slug)}"]`).forEach(a=>{const card=a.closest('article,div')||a;const heading=card.querySelector('h2,h3,h4');if(heading)heading.textContent=item.title;const ps=card.querySelectorAll('p');if(ps.length&&item.excerpt)ps[ps.length-1].textContent=item.excerpt;if(!item.is_published)a.style.display='none';});});}

  // The original compiled /our-team page already has a detailed Managing Partner
  // biography. Keep it, but show published CMS team members beneath it. Without
  // this, an admin could upload and publish a photograph which never became visible.
  function syncTeamSection(main) {
    const members = Array.isArray(cms?.teamMembers) ? cms.teamMembers.filter(x => x.is_published !== false && x.name) : [];
    const partnerHeading = [...main.querySelectorAll('h2')].find(h => h.textContent.trim() === 'Asbjorn Ng’ani');
    const partnerArticle = partnerHeading?.closest('article');
    const partnerSection = partnerArticle?.closest('section');
    if (!partnerSection) return; // Wait for React to mount the approved Team layout.

    const partner = members.find(x => x.name.trim().toLowerCase().replace(/[’']/g, '') === 'asbjorn ngani');
    const portrait = partnerArticle.querySelector('.team-managing-portrait');
    if (portrait && partner?.image_url && portrait.dataset.cmsImage !== partner.image_url) {
      portrait.dataset.cmsImage = partner.image_url;
      portrait.onerror = () => { portrait.onerror = null; portrait.src = '/assets/media/asbjorn-ngani-portrait.webp'; };
      portrait.src = partner.image_url;
    }

    const others = members.filter(x => x !== partner);
    const existing = main.querySelector('[data-cms-team-members]');
    if (!others.length) { existing?.remove(); return; }
    const signature = JSON.stringify(others.map(x => [x.id,x.name,x.role_title,x.qualifications,x.bio,x.image_url,x.sort_order]));
    if (existing?.dataset.signature === signature) return;
    const section = existing || el('section','cms-team-list');
    section.dataset.cmsTeamMembers = 'true';
    section.dataset.signature = signature;
    section.textContent = '';
    const wrap = el('div','cms-wrap');
    wrap.append(el('h2','','Our Legal Team'));
    const grid = el('div','cms-team-grid');
    for (const item of others) {
      const article = el('article','cms-person');
      addImage(article,item.image_url,`Portrait of ${item.name}`);
      const content = el('div','cms-person-body');
      content.append(el('h3','',item.name));
      if (item.role_title) content.append(el('p','cms-role',item.role_title));
      if (item.qualifications) content.append(el('p','',item.qualifications));
      if (item.bio) content.append(el('p','',item.bio));
      article.append(content);
      grid.append(article);
    }
    wrap.append(grid);
    section.append(wrap);
    if (!existing) partnerSection.after(section);
  }

  function apply(){ if(!cms)return;const path=location.pathname.replace(/\/+$/,'')||'/';const main=document.querySelector('main');applyGlobalText();applyContactDetails();if(main?.dataset.cmsRoute===path)return;managedMode=false;if(path==='/our-team'){if(main)syncTeamSection(main);return;}if(preservedCompiledRoutes.has(path))return;if(path.startsWith('/practice-areas/')){if(!renderPracticeDetail(path.split('/').pop()))renderNotFound();return;}if(path.startsWith('/insights/')){if(!renderInsightDetail(path.split('/').pop()))renderNotFound();return;}if(path==='/'){if(!applyPageText('home'))renderNotFound();return;}if(path==='/about'){if(!applyPageText('about'))renderNotFound();return;}if(path==='/contact'){if(!applyPageText('contact'))renderNotFound();return;}updateHardcodedCards();}

  function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;apply();},120);}
  function patchHistory(){for(const name of ['pushState','replaceState']){const original=history[name];history[name]=function(...args){const r=original.apply(this,args);schedule();return r;};}addEventListener('popstate',schedule);}
  document.addEventListener('click',(event)=>{ if(!managedMode)return; const a=event.target.closest?.('a[href]'); if(!a)return; const url=new URL(a.href,location.href); if(url.origin!==location.origin||a.target==='_blank'||url.hash&&url.pathname===location.pathname)return; event.preventDefault(); location.href=url.href; },true);

  async function start(){try{const r=await fetch('/api/cms/public',{cache:'no-store'});const payload=await r.json();if(!r.ok||!payload.ok)return;cms=payload.data;patchHistory();schedule();new MutationObserver(()=>schedule()).observe(document.getElementById('root')||document.body,{childList:true,subtree:true});}catch{ /* Static website remains fully usable if CMS is unavailable. */ }}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
