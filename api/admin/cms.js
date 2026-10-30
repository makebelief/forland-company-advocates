import { body, json, method, requireSameOrigin, session } from '../../lib/admin-auth.js';
import { audit, captureRevision, deleteResource, recentAudit, reorderResource, restoreLatestRevision, sanitizeResource, sanitizeSetting, saveSetting, snapshot, rest, upsertResource } from '../../lib/cms-data.js';

function contentTypeOk(req) {
  return String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json');
}

export default async function handler(req, res) {
  if (!method(req, res, ['GET', 'POST']) || !requireSameOrigin(req, res)) return;
  try {
    const current = await session(req, res, { allowForcedPasswordChange: false });
    if (!current) return json(res, 401, { ok: false, message: 'Administrator authentication is required.' });

    if (req.method === 'GET') {
      const url = new URL(req.url, 'https://admin.local');
      if (url.searchParams.get('view') === 'inquiries') {
        return json(res, 200, { ok: true, inquiries: await rest('cms_inquiries?select=id,full_name,company,email,phone,practice_area,message,status,created_at&order=created_at.desc&limit=100') });
      }
      if (url.searchParams.get('view') === 'audit') {
        return json(res, 200, { ok: true, audit: await recentAudit(50) });
      }
      return json(res, 200, { ok: true, data: await snapshot() });
    }

    if (!contentTypeOk(req)) return json(res, 415, { ok: false, message: 'JSON requests are required.' });
    const length = Number(req.headers['content-length'] || 0);
    if (length > 300000) return json(res, 413, { ok: false, message: 'CMS request is too large.' });

    const input = await body(req);
    const action = typeof input.action === 'string' ? input.action : '';
    const resource = typeof input.resource === 'string' ? input.resource : '';

    if (action === 'save_setting') {
      const key = input.key === 'seo' ? 'seo' : 'site';
      const value = sanitizeSetting(key, input.value || {});
      const result = await saveSetting(key, value, current.user.id);
      await audit(current.user, 'update', `settings:${key}`, key, { fields: Object.keys(value) });
      return json(res, 200, { ok: true, record: result?.[0] || null });
    }

    if (action === 'save') {
      const value = sanitizeResource(resource, input.data || {}, current.user.id);
      if (resource !== 'pages' && (!value.title && !value.name)) return json(res, 400, { ok: false, message: 'A title or name is required.' });
      if (value.id) await captureRevision(resource, value.id, current.user.id);
      const result = await upsertResource(resource, value);
      const record = result?.[0] || null;
      await audit(current.user, record?.created_at === record?.updated_at ? 'create' : 'update', resource, record?.id || record?.slug || value.slug, { slug: value.slug, title: value.title || value.name || '' });
      return json(res, 200, { ok: true, record });
    }

    if (action === 'restore_revision') {
      const result = await restoreLatestRevision(resource, input.id, current.user.id);
      const record = result?.[0] || null;
      await audit(current.user, 'restore', resource, input.id, { slug: record?.slug || '' });
      return json(res, 200, { ok: true, record });
    }

    if (action === 'delete') {
      const result = await deleteResource(resource, input.id);
      const record = result?.[0] || null;
      await audit(current.user, 'delete', resource, input.id, { slug: record?.slug || '' });
      return json(res, 200, { ok: true, record });
    }

    if (action === 'reorder') {
      await reorderResource(resource, input.ids, current.user.id);
      await audit(current.user, 'reorder', resource, '', { count: Array.isArray(input.ids) ? input.ids.length : 0 });
      return json(res, 200, { ok: true });
    }

    return json(res, 400, { ok: false, message: 'Unsupported CMS action.' });
  } catch (error) {
    return json(res, error.statusCode || 500, { ok: false, message: error.statusCode && error.statusCode < 500 ? error.message : 'The CMS request could not be completed.' });
  }
}
