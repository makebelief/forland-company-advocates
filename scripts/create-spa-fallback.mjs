import { readFile, writeFile } from 'node:fs/promises';

const home = await readFile('dist/index.html', 'utf8');
const notFound = home
  .replace(/<title>.*?<\/title>/s, '<title>Page Not Found | Forland & Company Advocates</title>')
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="The requested page could not be found." />')
  .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow" />')
  .replace(/<link rel="canonical"[^>]*>/, '')
  .replace(/<link rel="alternate"[^>]*>/g, '')
  .replace(/<link rel="preload" as="image"[^>]*>/g, '')
  .replace(/\s*<meta property="og:[^"]+"[^>]*>/g, '')
  .replace(/\s*<meta name="twitter:[^"]+"[^>]*>/g, '')
  .replace(/\s*<meta name="geo\.[^"]+"[^>]*>/g, '')
  .replace(/<script id="structured-data" type="application\/ld\+json">.*?<\/script>/s, '')
  .replace(
    /<div id="root">[\s\S]*<\/div>\s*<\/body>/,
    `<div id="root"><main class="seo-fallback-main" id="main-content"><article><p class="seo-fallback-eyebrow">Error 404</p><h1>Page not found</h1><p class="seo-fallback-intro">The requested page does not exist or may have moved.</p><p><a href="/">Return to the home page</a> or <a href="/contact">contact the firm</a>.</p></article></main></div>\n  </body>`,
  );
await writeFile('dist/404.html', notFound);
