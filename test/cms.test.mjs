import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ADMIN_EMAIL,
  authorizedEmail,
  passwordPolicy,
  sameOrigin,
  session,
} from '../lib/admin-auth.js';
import {
  deleteResource,
  sanitizeResource,
  sanitizeSetting,
  snapshot,
} from '../lib/cms-data.js';
import loginHandler from '../api/admin/login.js';
import sessionHandler from '../api/admin/session.js';
import cmsHandler from '../api/admin/cms.js';
import mediaHandler from '../api/admin/media.js';
import pageHandler from '../api/cms/page.js';

process.env.SUPABASE_URL = 'https://project.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
process.env.SUPABASE_SECRET_KEY = 'test-server-secret';

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

function request(method = 'GET', options = {}) {
  return {
    method,
    url: options.url || '/',
    body: options.body,
    headers: {
      host: 'forlandcompanyadvocates.co.ke',
      origin: 'https://forlandcompanyadvocates.co.ke',
      ...(options.headers || {}),
    },
    socket: { remoteAddress: '127.0.0.1' },
  };
}

function response() {
  const headers = new Map();
  return {
    statusCode: 0,
    headers,
    body: '',
    setHeader(name, value) { headers.set(name.toLowerCase(), value); },
    end(value = '') { this.body = String(value); },
    json() { return JSON.parse(this.body); },
  };
}

function authenticatedFetch(extra = () => null) {
  return async (url, options = {}) => {
    const custom = extra(String(url), options);
    if (custom) return custom;
    if (String(url).endsWith('/auth/v1/user')) {
      return new Response(JSON.stringify({ id: '858d82a7-2835-41a1-a9a8-8d8b932540a6', email: ADMIN_EMAIL }), { status: 200 });
    }
    if (String(url).includes('/rest/v1/admin_security')) {
      return new Response(JSON.stringify([{ must_change_password: false }]), { status: 200 });
    }
    throw new Error('Unexpected fetch: ' + url);
  };
}

test('only the configured administrator email is authorized', () => {
  assert.equal(authorizedEmail(ADMIN_EMAIL.toUpperCase()), true);
  assert.equal(authorizedEmail('visitor@example.com'), false);
  assert.equal(authorizedEmail(''), false);
});

test('password policy requires a strong 14-character password', () => {
  assert.equal(passwordPolicy('Short1!'), false);
  assert.equal(passwordPolicy('alllowercase123!'), false);
  assert.equal(passwordPolicy('Strong-Example-42!'), true);
});

test('same-origin validation rejects foreign browser origins', () => {
  assert.equal(sameOrigin(request('POST')), true);
  assert.equal(sameOrigin(request('POST', { headers: { origin: 'https://attacker.example' } })), false);
});

test('wrong admin email is rejected before an authentication request', async () => {
  global.fetch = async () => { throw new Error('fetch must not be called'); };
  const res = response();
  await loginHandler(request('POST', { body: { email: 'visitor@example.com', password: 'irrelevant' } }), res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.json().message, 'Invalid email or password.');
});

test('missing sessions are rejected by session and protected CMS endpoints', async () => {
  global.fetch = async () => { throw new Error('fetch must not be called'); };
  const sessionRes = response();
  await sessionHandler(request('GET'), sessionRes);
  assert.equal(sessionRes.statusCode, 401);
  assert.equal(sessionRes.json().authenticated, false);

  const cmsRes = response();
  await cmsHandler(request('GET'), cmsRes);
  assert.equal(cmsRes.statusCode, 401);

  const mediaRes = response();
  await mediaHandler(request('POST', { headers: { 'content-type': 'application/json' }, body: {} }), mediaRes);
  assert.equal(mediaRes.statusCode, 401);
});

test('a valid allow-listed session is recognized', async () => {
  global.fetch = authenticatedFetch();
  const req = request('GET', { headers: { cookie: '__Host-forland_admin_at=test-access-token' } });
  const res = response();
  const current = await session(req, res);
  assert.equal(current.user.email, ADMIN_EMAIL);
  assert.equal(current.mustChangePassword, false);
});

test('CMS sanitization rejects unsupported resources, bad slugs, IDs, URLs and oversized input', async () => {
  assert.throws(() => sanitizeResource('unknown', {}, 'user'), /Unsupported CMS resource/);
  assert.throws(() => sanitizeResource('practice_areas', { slug: '../bad', title: 'Bad' }, 'user'), /Invalid slug/);
  assert.throws(() => sanitizeResource('practice_areas', { id: 'not-a-uuid', slug: 'good', title: 'Good' }, 'user'), /Invalid record ID/);
  assert.throws(() => sanitizeResource('practice_areas', { slug: 'good', title: 'x'.repeat(181) }, 'user'), /character limit/);
  assert.throws(() => sanitizeResource('practice_areas', { slug: 'good', title: 'Good', image_url: '//attacker.example/image.png' }, 'user'), /Only HTTPS/);
  await assert.rejects(() => deleteResource('practice_areas', 'bad-id'), /Invalid record ID/);
});

test('unknown input fields are discarded and drafts stay unpublished', () => {
  const record = sanitizeResource('insights', {
    slug: 'safe-article',
    title: 'Safe article',
    body: '<script>alert(1)</script>',
    unexpected_admin: true,
  }, '858d82a7-2835-41a1-a9a8-8d8b932540a6');
  assert.equal(record.is_published, false);
  assert.equal('unexpected_admin' in record, false);
  assert.equal(record.body, '<script>alert(1)</script>');
  assert.equal(record.featured_image_alt, 'Safe article');
  assert.equal(record.seo_title, 'Safe article | Forland & Company Advocates');
  assert.equal(record.meta_description, '<script>alert(1)</script>');
});

test('article slugs and search metadata are generated and related practices are validated', () => {
  const record = sanitizeResource('insights', {
    title: 'A Guide to Kenyan Employment Law',
    excerpt: 'A practical guide for employers in Kenya.',
    related_practice_area_id: '858d82a7-2835-41a1-a9a8-8d8b932540a6',
  }, '858d82a7-2835-41a1-a9a8-8d8b932540a6');
  assert.equal(record.slug, 'a-guide-to-kenyan-employment-law');
  assert.equal(record.meta_description, 'A practical guide for employers in Kenya.');
  assert.throws(() => sanitizeResource('insights', { title: 'Bad relation', related_practice_area_id: 'not-an-id' }, 'user'), /Invalid record ID/);
});

test('settings reject oversized values and unknown groups', () => {
  assert.throws(() => sanitizeSetting('seo', { site_title: 'x'.repeat(181) }), /character limit/);
  assert.throws(() => sanitizeSetting('private', {}), /Unsupported settings group/);
});

test('public snapshots query only published records and allow-listed settings', async () => {
  const urls = [];
  global.fetch = async (url) => {
    urls.push(String(url));
    return new Response('[]', { status: 200 });
  };
  const data = await snapshot({ publicOnly: true });
  assert.deepEqual(data.media, []);
  assert.ok(urls.some((url) => url.includes('cms_settings?key=in.(site,seo)')));
  assert.equal(urls.filter((url) => url.includes('is_published=eq.true')).length, 4);
  assert.equal(urls.some((url) => url.includes('cms_media')), false);
});

test('CMS runtime preserves the approved compiled list-page layouts', async () => {
  const runtime = await readFile(new URL('../public/assets/js/cms-runtime.js', import.meta.url), 'utf8');
  assert.match(runtime, /new Set\(\['\/practice-areas', '\/our-team', '\/insights'\]\)/);
  assert.doesNotMatch(runtime, /renderPracticeList|renderTeam|renderInsights/);
  assert.match(runtime, /preservedCompiledRoutes\.has\(path\)/);
});

test('dynamic routes return 404 when a record is unpublished or missing', async () => {
  global.fetch = async () => new Response('[]', { status: 200 });
  const res = response();
  await pageHandler(request('GET', { url: '/api/cms/page?type=insight&slug=private-draft' }), res);
  assert.equal(res.statusCode, 404);
  assert.match(res.headers.get('x-robots-tag'), /noindex/);
});

test('published insight HTML includes CMS metadata and its related practice link', async () => {
  global.fetch = async (url) => {
    if (String(url).includes('/cms_insights?')) return new Response(JSON.stringify([{
      slug: 'employment-compliance',
      title: 'Employment Compliance: What Employers Need to Know',
      seo_title: 'Employment Compliance Guide | Forland Advocates',
      meta_description: 'A practical employment compliance guide for Kenyan employers.',
      excerpt: 'Employment guidance.',
      body: '## Employer checklist\n- Keep **written records**\n<script>alert(1)</script>',
      is_published: true,
      created_at: '2026-09-01T00:00:00Z',
      updated_at: '2026-09-02T00:00:00Z',
      published_at: '2026-09-01T00:00:00Z',
    }]), { status: 200 });
    return new Response('[]', { status: 200 });
  };
  const res = response();
  await pageHandler(request('GET', { url: '/api/cms/page?type=insight&slug=employment-compliance' }), res);
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /<title>Employment Compliance Guide \| Forland Advocates<\/title>/);
  assert.match(res.body, /href="\/practice-areas\/employment-labour"/);
  assert.match(res.body, /<h2>Employer checklist<\/h2>/);
  assert.match(res.body, /<strong>written records<\/strong>/);
  assert.doesNotMatch(res.body, /<script>alert\(1\)<\/script>/);
  assert.match(res.body, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.equal((res.body.match(/<h1\b/g) || []).length, 1);
});

test('media rejects extension and signature mismatches after authentication', async () => {
  global.fetch = authenticatedFetch();
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).toString('base64');
  const req = request('POST', {
    headers: {
      cookie: '__Host-forland_admin_at=test-access-token',
      'content-type': 'application/json',
    },
    body: { fileName: 'spoofed.jpg', mimeType: 'image/png', altText: '', base64: pngSignature },
  });
  const res = response();
  await mediaHandler(req, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.json().message, /extension, MIME type and image signature/);
});
