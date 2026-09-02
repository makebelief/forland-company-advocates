import { readFile, writeFile } from 'node:fs/promises';

const home = await readFile('dist/index.html', 'utf8');
const notFound = home
  .replace(/<title>.*?<\/title>/s, '<title>Page Not Found | Forland & Company Advocates</title>')
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="The requested page could not be found." />')
  .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow" />')
  .replace(/<link rel="canonical"[^>]*>/, '');
await writeFile('dist/404.html', notFound);
