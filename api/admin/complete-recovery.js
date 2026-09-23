import {
  authorizedEmail,
  body,
  getUser,
  json,
  method,
  requireSameOrigin,
  setMustChangePassword,
  setSessionCookies,
} from '../../lib/admin-auth.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST']) || !requireSameOrigin(req, res)) return;
  try {
    const input = await body(req);
    const accessToken = typeof input.accessToken === 'string' ? input.accessToken : '';
    const refreshToken = typeof input.refreshToken === 'string' ? input.refreshToken : '';
    const expiresIn = Number(input.expiresIn) || 3600;
    if (!accessToken || !refreshToken) return json(res, 400, { ok: false, message: 'Recovery link is incomplete.' });

    const userResult = await getUser(accessToken);
    if (!userResult.response.ok || !userResult.data?.id || !authorizedEmail(userResult.data.email)) {
      return json(res, 401, { ok: false, message: 'Recovery link is invalid or expired.' });
    }

    await setMustChangePassword(userResult.data.id, true);
    setSessionCookies(res, { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn });
    return json(res, 200, { ok: true, mustChangePassword: true });
  } catch (error) {
    return json(res, error.statusCode || 500, { ok: false, message: 'Unable to complete password recovery.' });
  }
}
