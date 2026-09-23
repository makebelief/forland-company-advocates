import { rm } from 'node:fs/promises';
import { pages } from './seo-pages.mjs';

const dynamicPaths = Object.keys(pages).filter((path) => (
  path.startsWith('/practice-areas/') || path.startsWith('/insights/')
));

for (const path of dynamicPaths) {
  await rm('dist' + path, { recursive: true, force: true });
}

console.log('Removed ' + dynamicPaths.length + ' generated detail-page copies; CMS route functions are authoritative.');
