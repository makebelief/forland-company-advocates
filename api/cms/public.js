import { method } from '../../lib/admin-auth.js';
import { snapshot } from '../../lib/cms-data.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  try {
    const data = await snapshot({ publicOnly: true });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(JSON.stringify({ ok: true, data }));
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ ok: false, message: 'Website content is temporarily unavailable.' }));
  }
}
