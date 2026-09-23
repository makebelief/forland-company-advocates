import { json, method, session } from '../../lib/admin-auth.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  try {
    const current = await session(req, res);
    if (!current) return json(res, 401, { ok: false, authenticated: false });
    return json(res, 200, {
      ok: true,
      authenticated: true,
      email: current.user.email,
      mustChangePassword: current.mustChangePassword,
    });
  } catch (error) {
    return json(res, error.statusCode || 500, { ok: false, authenticated: false, message: 'Unable to verify the session.' });
  }
}
