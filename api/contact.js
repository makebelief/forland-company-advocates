import { json, method, requireSameOrigin, supabaseServerConfig } from '../lib/admin-auth.js';

const MAX_BODY = 12_000;
const text = (value, length) => typeof value === 'string' ? value.trim().slice(0, length + 1) : '';
const field = (value, length) => {
  const result = text(value, length);
  if (result.length > length) throw Object.assign(new Error('One or more fields are too long.'), { statusCode: 400 });
  return result;
};

export default async function handler(req, res) {
  if (!method(req, res, ['POST']) || !requireSameOrigin(req, res)) return;
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/x-www-form-urlencoded')) {
    return json(res, 415, { ok: false, message: 'Unsupported form submission.' });
  }
  if (Number(req.headers['content-length'] || 0) > MAX_BODY) {
    return json(res, 413, { ok: false, message: 'Your message is too large.' });
  }
  try {
    let input;
    if (typeof req.body === 'string') input = new URLSearchParams(req.body);
    else if (req.body && typeof req.body === 'object') input = new URLSearchParams(req.body);
    else {
      let raw = '';
      for await (const chunk of req) {
        raw += chunk.toString();
        if (raw.length > MAX_BODY) return json(res, 413, { ok: false, message: 'Your message is too large.' });
      }
      input = new URLSearchParams(raw);
    }
    if (input.get('website_alt')) return json(res, 200, { ok: true }); // Honeypot.
    const full_name = field(input.get('name'), 160);
    const company = field(input.get('company'), 180);
    const email = field(input.get('email'), 320).toLowerCase();
    const phone = field(input.get('phone'), 80);
    const practice_area = field(input.get('practice_area'), 180);
    const message = field(input.get('message'), 500);
    if (full_name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      return json(res, 400, { ok: false, message: 'Enter your full name, a valid email address and a message of at least 10 characters.' });
    }
    if (input.get('privacy') !== 'on') {
      return json(res, 400, { ok: false, message: 'Please acknowledge the privacy notice before submitting.' });
    }

    const { url, serviceKey } = supabaseServerConfig();
    const response = await fetch(`${url}/rest/v1/cms_inquiries`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ full_name, company, email, phone, practice_area, message, privacy_ack: true }),
    });
    if (!response.ok) {
      console.error('Contact inquiry could not be saved. Supabase status:', response.status);
      return json(res, 503, { ok: false, message: 'Your inquiry could not be delivered. Please try again shortly.' });
    }
    return json(res, 200, { ok: true, message: 'Inquiry received.' });
  } catch (error) {
    if (error.statusCode === 400) return json(res, 400, { ok: false, message: error.message });
    console.error('Contact inquiry server error:', error?.message || 'Unknown error');
    return json(res, 503, { ok: false, message: 'Your inquiry could not be delivered. Please try again shortly.' });
  }
}
