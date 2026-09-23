import {
  body,
  json,
  method,
  passwordPolicy,
  requireSameOrigin,
  session,
  setMustChangePassword,
  updatePassword,
} from '../../lib/admin-auth.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST']) || !requireSameOrigin(req, res)) return;
  try {
    const current = await session(req, res);
    if (!current) return json(res, 401, { ok: false, message: 'Your session has expired. Please sign in again.' });

    const input = await body(req);
    const password = typeof input.password === 'string' ? input.password : '';
    if (!passwordPolicy(password)) {
      return json(res, 400, {
        ok: false,
        message: 'Use at least 14 characters with uppercase, lowercase, a number and a symbol.',
      });
    }

    const changed = await updatePassword(current.accessToken, password);
    if (!changed.response.ok) {
      return json(res, 400, { ok: false, message: 'Unable to change the password. Try a different password.' });
    }

    await setMustChangePassword(current.user.id, false);
    return json(res, 200, { ok: true, message: 'Password changed successfully.' });
  } catch (error) {
    return json(res, error.statusCode || 500, { ok: false, message: 'Unable to change the password.' });
  }
}
