import { authorizedEmail, body, json, method, requestPasswordRecovery, requireSameOrigin } from '../../lib/admin-auth.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST']) || !requireSameOrigin(req, res)) return;
  const generic = { ok: true, message: 'If the administrator account is eligible, a password reset email will be sent.' };
  try {
    const input = await body(req);
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    if (!authorizedEmail(email)) return json(res, 200, generic);
    await requestPasswordRecovery(email);
    return json(res, 200, generic);
  } catch {
    return json(res, 200, generic);
  }
}
