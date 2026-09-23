import { clearSessionCookies, json, logoutSupabase, method, requireSameOrigin, session } from '../../lib/admin-auth.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST']) || !requireSameOrigin(req, res)) return;
  try {
    const current = await session(req, res).catch(() => null);
    if (current?.accessToken) await logoutSupabase(current.accessToken);
    clearSessionCookies(res);
    return json(res, 200, { ok: true });
  } catch {
    clearSessionCookies(res);
    return json(res, 200, { ok: true });
  }
}
