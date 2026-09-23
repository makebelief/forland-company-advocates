import { body, json, method, requireSameOrigin, session, supabaseServerConfig } from '../../lib/admin-auth.js';
import { audit, deleteMediaRecord, saveMediaRecord } from '../../lib/cms-data.js';

const MIME_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_BYTES = 2_500_000;
const MAX_JSON_BYTES = 3_500_000;
const MIME_EXTENSIONS = {
  'image/jpeg': new Set(['jpg', 'jpeg']),
  'image/png': new Set(['png']),
  'image/webp': new Set(['webp']),
};

function detectedMime(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) return 'image/png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 12 && buffer.toString('ascii',0,4) === 'RIFF' && buffer.toString('ascii',8,12) === 'WEBP') return 'image/webp';
  return '';
}

function safeName(value) {
  const raw = typeof value === 'string' ? value.trim().slice(0,180) : 'image';
  return raw.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'image';
}

async function storage(path, options = {}) {
  const { url, serviceKey } = supabaseServerConfig();
  return fetch(`${url}/storage/v1/${path}`, {
    ...options,
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, ...(options.headers || {}) },
  });
}

export default async function handler(req, res) {
  if (!method(req, res, ['POST', 'DELETE']) || !requireSameOrigin(req, res)) return;
  try {
    const current = await session(req, res, { allowForcedPasswordChange: false });
    if (!current) return json(res, 401, { ok: false, message: 'Administrator authentication is required.' });
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return json(res, 415, { ok: false, message: 'JSON requests are required.' });
    const length = Number(req.headers['content-length'] || 0);
    if (length > MAX_JSON_BYTES) return json(res, 413, { ok: false, message: 'Upload request is too large.' });
    const input = await body(req);

    if (req.method === 'POST') {
      const base64 = typeof input.base64 === 'string' ? input.base64.replace(/^data:[^;]+;base64,/, '') : '';
      if (!base64 || base64.length > Math.ceil(MAX_BYTES / 3) * 4 + 4 || base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
        return json(res, 400, { ok: false, message: 'The image data is malformed.' });
      }
      const buffer = Buffer.from(base64, 'base64');
      if (!buffer.length || buffer.length > MAX_BYTES) return json(res, 400, { ok: false, message: 'Image must be between 1 byte and 2.5 MB.' });
      const mime = detectedMime(buffer);
      const fileName = safeName(input.fileName);
      const extension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
      if (!MIME_EXT[mime] || mime !== input.mimeType || !MIME_EXTENSIONS[mime]?.has(extension)) {
        return json(res, 400, { ok: false, message: 'The file extension, MIME type and image signature must be a genuine JPG, PNG or WebP match.' });
      }
      const unique = `${Date.now()}-${crypto.randomUUID()}.${MIME_EXT[mime]}`;
      const upload = await storage(`object/cms-media/${unique}`, { method: 'POST', headers: { 'Content-Type': mime, 'x-upsert': 'false', 'Cache-Control': '31536000' }, body: buffer });
      if (!upload.ok) return json(res, 503, { ok: false, message: 'Image upload failed.' });
      const { url } = supabaseServerConfig();
      const publicUrl = `${url}/storage/v1/object/public/cms-media/${unique}`;
      const rows = await saveMediaRecord({ storage_path: unique, public_url: publicUrl, file_name: fileName, mime_type: mime, size_bytes: buffer.length, alt_text: typeof input.altText === 'string' ? input.altText.trim().slice(0,500) : '', created_by: current.user.id });
      const record = rows?.[0] || null;
      await audit(current.user, 'upload', 'media', record?.id || unique, { file_name: fileName, mime_type: mime, size_bytes: buffer.length });
      return json(res, 200, { ok: true, record });
    }

    const rows = await deleteMediaRecord(input.id);
    const record = rows?.[0];
    if (!record) return json(res, 404, { ok: false, message: 'Media item was not found.' });
    await storage(`object/cms-media/${record.storage_path}`, { method: 'DELETE' }).catch(() => null);
    await audit(current.user, 'delete', 'media', record.id, { file_name: record.file_name });
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, error.statusCode || 500, { ok: false, message: error.statusCode && error.statusCode < 500 ? error.message : 'Media request failed.' });
  }
}
