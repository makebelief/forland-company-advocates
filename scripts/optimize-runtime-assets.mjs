import { access, readFile, writeFile } from 'node:fs/promises';

const bundlePath = 'public/assets/js/site.min.js';
let bundle = await readFile(bundlePath, 'utf8');

const replacements = new Map([
  ['/assets/media/hero-poster-nairobi.jpg', '/assets/media/hero-poster-nairobi.webp'],
  ['/assets/media/nairobi-drone-film-mobile.mp4', '/assets/media/nairobi-drone-film-mobile-loop.mp4'],
  ['/assets/media/nairobi-drone-film.mp4', '/assets/media/nairobi-drone-film-loop.mp4'],
]);

for (const [original, optimized] of replacements) {
  bundle = bundle.replaceAll(original, optimized);
}

// Keep original JPEG/PNG files for social sharing metadata, while serving
// smaller WebP variants in the interactive application whenever available.
const displayImages = [...new Set([...bundle.matchAll(/\/assets\/media\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png)/gi)].map((match) => match[0]))];
for (const original of displayImages) {
  const optimized = original.replace(/\.(?:jpe?g|png)$/i, '.webp');
  try {
    await access(`public${optimized}`);
    bundle = bundle.replaceAll(original, optimized);
  } catch {
    // Retain the original if an optimized display copy does not exist.
  }
}

// The downloaded production bundle renders all content images eagerly. Native
// lazy loading keeps off-screen practice and insight imagery out of the
// critical path while preserving it for users and crawlers.
bundle = bundle.replaceAll('(`img`,{src:', '(`img`,{loading:`lazy`,decoding:`async`,src:');

// The footer column labels follow the page's H1/H2 hierarchy. The downloaded
// bundle used H4 elements even though no H3 preceded them, which is announced
// as a broken heading outline by assistive technology.
const footerH4 = '(`h4`,{className:`text-xs font-semibold tracking-[0.2em] text-background-50 uppercase`';
const footerH2 = '(`h2`,{className:`text-xs font-semibold tracking-[0.2em] text-background-50 uppercase`';
const footerH4Count = bundle.split(footerH4).length - 1;
const footerH2Count = bundle.split(footerH2).length - 1;
if (footerH4Count === 3) {
  bundle = bundle.replaceAll(footerH4, footerH2);
} else if (footerH4Count !== 0 || footerH2Count !== 3) {
  throw new Error(`Unexpected footer heading markers: h4=${footerH4Count}, h2=${footerH2Count}`);
}

await writeFile(bundlePath, bundle);

const lazyImages = (bundle.match(/\(`img`,\{loading:`lazy`,decoding:`async`,src:/g) || []).length;
console.log(`Optimized runtime media references and marked ${lazyImages} images for lazy loading.`);
