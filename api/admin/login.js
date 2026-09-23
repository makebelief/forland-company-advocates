import {
  authorizedEmail,
  body,
  getAdminState,
  json,
  method,
  requireSameOrigin,
  setSessionCookies,
  signIn,
} from '../../lib/admin-auth.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST']) || !requireSameOrigin(req, res)) return;
  try {
    const input = await body(req);
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const password = typeof input.password === 'string' ? input.password : '';

    if (!authorizedEmail(email) || !password) {
      return json(res, 401, { ok: false, message: 'Invalid email or password.' });
    }

    const result = await signIn(req, email, password);
    if (!result.response.ok || !result.data?.access_token || !result.data?.refresh_token || !result.data?.user) {
      return json(res, 401, { ok: false, message: 'Invalid email or password.' });
    }

    if (!authorizedEmail(result.data.user.email)) {
      return json(res, 403, { ok: false, message: 'Administrator access is not permitted.' });
    }

    const state = await getAdminState(result.data.user.id);
    setSessionCookies(res, result.data);
    return json(res, 200, {
      ok: true,
      email: result.data.user.email,
      mustChangePassword: state.must_change_password !== false,
    });
  } catch (error) {
    return json(res, error.statusCode || 500, { ok: false, message: 'Unable to sign in right now.' });
  }
}
