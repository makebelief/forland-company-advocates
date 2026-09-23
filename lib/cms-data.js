import { supabaseServerConfig } from './admin-auth.js';

const TABLES = {
  pages: 'cms_pages',
  practice_areas: 'cms_practice_areas',
  team_members: 'cms_team_members',
  insights: 'cms_insights',
  media: 'cms_media',
  audit: 'cms_audit_log',
  settings: 'cms_settings',
};

const text = (value, max = 10000) => {
  if (typeof value !== 'string') return '';
  const clean = value.trim();
  if (clean.length > max) throw Object.assign(new Error(`Text exceeds the ${max}-character limit.`), { statusCode: 400 });
  return clean;
};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeId = (value) => {
  const id = text(value, 36);
  if (!uuidPattern.test(id)) throw Object.assign(new Error('Invalid record ID.'), { statusCode: 400 });
  return id;
};
const bool = (value) => value === true;
const integer = (value, min = 0, max = 10000) => Math.max(min, Math.min(max, Number.parseInt(value, 10) || 0));
const safeSlug = (value, max = 80) => {
  const slug = text(value, max).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw Object.assign(new Error('Invalid slug.'), { statusCode: 400 });
  return slug;
};
const safeUrl = (value) => {
  const url = text(value, 1000);
  if (!url) return '';
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') throw new Error();
    return parsed.toString();
  } catch {
    throw Object.assign(new Error('Only HTTPS or local website URLs are allowed.'), { statusCode: 400 });
  }
};
const safeEmail = (value) => {
  const email = text(value, 320).toLowerCase();
  if (!email) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('Invalid email address.'), { statusCode: 400 });
  return email;
};
const safeArray = (value, maxItems = 80, maxLen = 300) => {
  const source = Array.isArray(value) ? value : typeof value === 'string' ? value.split('\n') : [];
  return source.map((item) => text(item, maxLen)).filter(Boolean).slice(0, maxItems);
};

function serviceHeaders(extra = {}) {
  const { serviceKey } = supabaseServerConfig();
  return { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', ...extra };
}

export async function rest(path, options = {}) {
  const { url } = supabaseServerConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: serviceHeaders(options.headers || {}),
  });
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) {
    const error = new Error(data?.message || data?.error_description || 'CMS database request failed.');
    error.statusCode = response.status >= 400 && response.status < 500 ? 400 : 503;
    throw error;
  }
  return data;
}

async function list(table, order = '') {
  const suffix = order ? `&order=${order}` : '';
  return rest(`${table}?select=*${suffix}`);
}

export async function snapshot({ publicOnly = false } = {}) {
  const settingsPromise = rest('cms_settings?key=in.(site,seo)&select=key,value,updated_at');
  const pagesFilter = publicOnly ? '&is_published=eq.true' : '';
  const pubFilter = publicOnly ? '&is_published=eq.true' : '';
  const [settingsRows, pages, practiceAreas, teamMembers, insights, media] = await Promise.all([
    settingsPromise,
    rest(`cms_pages?select=*${pagesFilter}&order=name.asc`),
    rest(`cms_practice_areas?select=*${pubFilter}&order=sort_order.asc,title.asc`),
    rest(`cms_team_members?select=*${pubFilter}&order=sort_order.asc,name.asc`),
    rest(`cms_insights?select=*${pubFilter}&order=sort_order.asc,published_at.desc.nullslast,created_at.desc`),
    publicOnly ? Promise.resolve([]) : rest('cms_media?select=*&order=created_at.desc'),
  ]);
  const settings = Object.fromEntries((settingsRows || []).map((row) => [row.key, row.value]));
  return { settings, pages: pages || [], practiceAreas: practiceAreas || [], teamMembers: teamMembers || [], insights: insights || [], media: media || [] };
}

export async function recentAudit(limit = 30) {
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 30));
  return rest(`cms_audit_log?select=id,user_email,action,resource,resource_id,details,created_at&order=created_at.desc&limit=${safeLimit}`);
}

export function sanitizeResource(resource, input = {}, userId) {
  if (resource === 'pages') {
    return {
      slug: safeSlug(input.slug),
      name: text(input.name, 120) || 'Page',
      content: {
        heading: text(input.content?.heading ?? input.heading, 300),
        intro: text(input.content?.intro ?? input.intro, 4000),
        body: text(input.content?.body ?? input.body, 30000),
      },
      seo_title: text(input.seo_title, 180),
      meta_description: text(input.meta_description, 320),
      og_image_url: safeUrl(input.og_image_url),
      is_published: input.is_published !== false,
      updated_by: userId,
    };
  }
  if (resource === 'practice_areas') {
    return {
      ...(input.id ? { id: safeId(input.id) } : {}),
      slug: safeSlug(input.slug), title: text(input.title, 180), summary: text(input.summary, 1200),
      body: text(input.body, 30000), services: safeArray(input.services, 100, 300), image_url: safeUrl(input.image_url),
      cta: text(input.cta, 160), sort_order: integer(input.sort_order), is_published: input.is_published !== false,
      seo_title: text(input.seo_title, 180), meta_description: text(input.meta_description, 320), updated_by: userId,
    };
  }
  if (resource === 'team_members') {
    return {
      ...(input.id ? { id: safeId(input.id) } : {}),
      slug: safeSlug(input.slug), name: text(input.name, 160), role_title: text(input.role_title, 220),
      qualifications: text(input.qualifications, 1200), bio: text(input.bio, 30000), email: safeEmail(input.email),
      phone: text(input.phone, 80), image_url: safeUrl(input.image_url), sort_order: integer(input.sort_order),
      is_published: input.is_published !== false, updated_by: userId,
    };
  }
  if (resource === 'insights') {
    const date = input.published_at ? new Date(input.published_at) : null;
    if (date && Number.isNaN(date.getTime())) throw Object.assign(new Error('Invalid publication date.'), { statusCode: 400 });
    return {
      ...(input.id ? { id: safeId(input.id) } : {}),
      slug: safeSlug(input.slug, 100), title: text(input.title, 220), category: text(input.category, 100) || 'Insights',
      excerpt: text(input.excerpt, 1600), body: text(input.body, 60000), featured_image_url: safeUrl(input.featured_image_url),
      author: text(input.author, 180) || 'Forland & Company Advocates', published_at: date ? date.toISOString() : null,
      is_published: input.is_published === true, seo_title: text(input.seo_title, 180),
      meta_description: text(input.meta_description, 320), updated_by: userId,
    };
  }
  throw Object.assign(new Error('Unsupported CMS resource.'), { statusCode: 400 });
}

export function sanitizeSetting(key, input = {}) {
  if (key === 'site') {
    return {
      firm_name: text(input.firm_name, 180), hero_title: text(input.hero_title, 300), hero_subtitle: text(input.hero_subtitle, 1200),
      primary_cta: text(input.primary_cta, 100), secondary_cta: text(input.secondary_cta, 100), location: text(input.location, 300),
      office_address: text(input.office_address, 600), phone: text(input.phone, 100), email: text(input.email, 320),
      office_hours: text(input.office_hours, 300), contact_heading: text(input.contact_heading, 300), contact_subtitle: text(input.contact_subtitle, 1500),
    };
  }
  if (key === 'seo') {
    return { site_title: text(input.site_title, 180), site_description: text(input.site_description, 320), og_image_url: safeUrl(input.og_image_url) };
  }
  throw Object.assign(new Error('Unsupported settings group.'), { statusCode: 400 });
}

export async function saveSetting(key, value, userId) {
  return rest('cms_settings?on_conflict=key', {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([{ key, value, updated_by: userId }]),
  });
}

export async function upsertResource(resource, value) {
  const table = TABLES[resource];
  if (!table || !['pages','practice_areas','team_members','insights'].includes(resource)) throw Object.assign(new Error('Unsupported CMS resource.'), { statusCode: 400 });
  const conflict = resource === 'pages' ? 'slug' : 'id';
  return rest(`${table}?on_conflict=${conflict}`, {
    method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify([value]),
  });
}

export async function deleteResource(resource, id) {
  const table = TABLES[resource];
  if (!table || !['practice_areas','team_members','insights'].includes(resource)) throw Object.assign(new Error('This resource cannot be deleted.'), { statusCode: 400 });
  const clean = safeId(id);
  return rest(`${table}?id=eq.${encodeURIComponent(clean)}`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
}

export async function reorderResource(resource, items, userId) {
  const table = TABLES[resource];
  if (!table || !['practice_areas','team_members','insights'].includes(resource)) throw Object.assign(new Error('Unsupported reorder resource.'), { statusCode: 400 });
  const safeItems = Array.isArray(items) ? items.slice(0, 200) : [];
  const results = [];
  for (let index = 0; index < safeItems.length; index += 1) {
    let id;
    try { id = safeId(safeItems[index]); } catch { continue; }
    results.push(await rest(`${table}?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ sort_order: index + 1, updated_by: userId }),
    }));
  }
  return results;
}

export async function audit(user, action, resource, resourceId = '', details = {}) {
  const scrubbed = { ...details };
  delete scrubbed.password;
  return rest('cms_audit_log', {
    method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify([{
      user_id: user.id, user_email: user.email || '', action: text(action, 80), resource: text(resource, 80),
      resource_id: text(resourceId, 200), details: scrubbed,
    }]),
  });
}

export async function saveMediaRecord(record) {
  return rest('cms_media', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify([record]) });
}

export async function deleteMediaRecord(id) {
  const clean = safeId(id);
  return rest(`cms_media?id=eq.${encodeURIComponent(clean)}&select=*`, { method: 'DELETE', headers: { Prefer: 'return=representation' } });
}
