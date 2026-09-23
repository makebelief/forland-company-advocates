const ADMIN_EMAIL = 'forlandcompanyadvocates@gmail.com';
const ACCESS_COOKIE = '__Host-forland_admin_at';
const REFRESH_COOKIE = '__Host-forland_admin_rt';
const ADMIN_ORIGIN = 'https://forlandcompanyadvocates.co.ke';

export { ADMIN_EMAIL };

function env(...names) {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function config() {
  const url = env('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
  const publishableKey = env(
    'SUPABASE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
  const serviceKey = env('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY');

  if (!url || !publishableKey || !serviceKey) {
    const error = new Error('Supabase server configuration is incomplete.');
    error.statusCode = 503;
    throw error;
  }
  return { url: url.replace(/\/$/, ''), publishableKey, serviceKey };
}


export function supabaseServerConfig() {
  return config();
}

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.end(JSON.stringify(body));
}

export function method(req, res, allowed) {
  if (allowed.includes(req.method)) return true;
  res.setHeader('Allow', allowed.join(', '));
  json(res, 405, { ok: false, message: 'Method not allowed.' });
  return false;
}

export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const parsed = new URL(origin);
    const host = String(req.headers.host || '').toLowerCase();
    const local = host.startsWith('localhost:') || host.startsWith('127.0.0.1:');
    if (local) return parsed.host.toLowerCase() === host;
    return origin === ADMIN_ORIGIN || parsed.host.toLowerCase() === host;
  } catch {
    return false;
  }
}

export function requireSameOrigin(req, res) {
  if (sameOrigin(req)) return true;
  json(res, 403, { ok: false, message: 'Request origin is not permitted.' });
  return false;
}

export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function authorizedEmail(value) {
  return normalizeEmail(value) === ADMIN_EMAIL;
}

export async function body(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return {}; }
}

function cookieMap(header = '') {
  return header.split(';').reduce((acc, part) => {
    const index = part.indexOf('=');
    if (index < 0) return acc;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function cookie(name, value, maxAge) {
  const encoded = encodeURIComponent(value);
  return `${name}=${encoded}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function expiredCookie(name) {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function setSessionCookies(res, session) {
  const accessMaxAge = Math.max(60, Math.min(Number(session.expires_in) || 3600, 3600));
  const refreshMaxAge = 60 * 60 * 24 * 7;
  res.setHeader('Set-Cookie', [
    cookie(ACCESS_COOKIE, session.access_token, accessMaxAge),
    cookie(REFRESH_COOKIE, session.refresh_token, refreshMaxAge),
  ]);
}

export function clearSessionCookies(res) {
  res.setHeader('Set-Cookie', [expiredCookie(ACCESS_COOKIE), expiredCookie(REFRESH_COOKIE)]);
}

function authHeaders(key, bearer = key) {
  return {
    apikey: key,
    Authorization: `Bearer ${bearer}`,
    'Content-Type': 'application/json',
  };
}

async function authFetch(path, { method = 'GET', key, bearer, payload, forwardedFor } = {}) {
  const { url, publishableKey } = config();
  const apiKey = key || publishableKey;
  const headers = authHeaders(apiKey, bearer || apiKey);
  if (forwardedFor) headers['Sb-Forwarded-For'] = forwardedFor;
  const response = await fetch(`${url}/auth/v1${path}`, {
    method,
    headers,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  let data = null;
  try { data = await response.json(); } catch { data = {}; }
  return { response, data };
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || String(req.socket?.remoteAddress || '');
}

export async function signIn(req, email, password) {
  const { publishableKey } = config();
  return authFetch('/token?grant_type=password', {
    method: 'POST',
    key: publishableKey,
    payload: { email, password },
    forwardedFor: clientIp(req),
  });
}

export async function refreshSession(refreshToken) {
  const { publishableKey } = config();
  return authFetch('/token?grant_type=refresh_token', {
    method: 'POST',
    key: publishableKey,
    payload: { refresh_token: refreshToken },
  });
}

export async function getUser(accessToken) {
  const { publishableKey } = config();
  return authFetch('/user', { key: publishableKey, bearer: accessToken });
}

export async function requestPasswordRecovery(email) {
  const { publishableKey } = config();
  const redirect = encodeURIComponent(`${ADMIN_ORIGIN}/admin?recovery=1`);
  return authFetch(`/recover?redirect_to=${redirect}`, {
    method: 'POST',
    key: publishableKey,
    payload: { email },
  });
}

export async function updatePassword(accessToken, password) {
  const { publishableKey } = config();
  return authFetch('/user', {
    method: 'PUT',
    key: publishableKey,
    bearer: accessToken,
    payload: { password },
  });
}

export async function logoutSupabase(accessToken) {
  if (!accessToken) return;
  const { publishableKey } = config();
  try {
    await authFetch('/logout', { method: 'POST', key: publishableKey, bearer: accessToken });
  } catch {
    // Clearing local HTTP-only cookies is still sufficient to end this browser session.
  }
}

async function adminStateRequest(path, options = {}) {
  const { url, serviceKey } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...authHeaders(serviceKey, serviceKey),
      ...(options.headers || {}),
    },
  });
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) {
    const error = new Error('Administrator security state is unavailable.');
    error.statusCode = 503;
    throw error;
  }
  return data;
}

export async function getAdminState(userId) {
  const rows = await adminStateRequest(`admin_security?user_id=eq.${encodeURIComponent(userId)}&select=must_change_password&limit=1`);
  if (Array.isArray(rows) && rows[0]) return rows[0];

  const created = await adminStateRequest('admin_security?on_conflict=user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([{ user_id: userId, must_change_password: true }]),
  });
  return Array.isArray(created) && created[0] ? created[0] : { must_change_password: true };
}

export async function setMustChangePassword(userId, value) {
  const rows = await adminStateRequest(`admin_security?user_id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ must_change_password: Boolean(value), updated_at: new Date().toISOString() }),
  });
  if (Array.isArray(rows) && rows.length) return rows[0];

  return adminStateRequest('admin_security?on_conflict=user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([{ user_id: userId, must_change_password: Boolean(value) }]),
  });
}

export async function session(req, res, { allowForcedPasswordChange = true } = {}) {
  const cookies = cookieMap(req.headers.cookie || '');
  let accessToken = cookies[ACCESS_COOKIE] || '';
  const refreshToken = cookies[REFRESH_COOKIE] || '';
  let userResult = accessToken ? await getUser(accessToken) : null;

  if ((!userResult || !userResult.response.ok) && refreshToken) {
    const refreshed = await refreshSession(refreshToken);
    if (refreshed.response.ok && refreshed.data?.access_token && refreshed.data?.refresh_token) {
      accessToken = refreshed.data.access_token;
      setSessionCookies(res, refreshed.data);
      userResult = await getUser(accessToken);
    }
  }

  if (!userResult?.response.ok || !userResult.data?.id || !authorizedEmail(userResult.data.email)) {
    clearSessionCookies(res);
    return null;
  }

  const state = await getAdminState(userResult.data.id);
  const mustChangePassword = state.must_change_password !== false;
  if (mustChangePassword && !allowForcedPasswordChange) return null;

  return { user: userResult.data, accessToken, mustChangePassword };
}

export function passwordPolicy(password) {
  if (typeof password !== 'string') return false;
  return password.length >= 14
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}
