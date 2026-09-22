import { spawnSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { pages } from './seo-pages.mjs';

const bundle = await readFile('public/assets/js/site.min.js', 'utf8');
const bundleImages = [...bundle.matchAll(/\/assets\/media\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png)/gi)].map((match) => match[0]);
const pageImages = Object.values(pages).map((page) => page.image.src);
const images = [...new Set([...bundleImages, ...pageImages])].sort();

for (const publicPath of images) {
  const source = `public${publicPath}`;
  const output = source.replace(/\.(?:jpe?g|png)$/i, '.webp');
  try {
    await access(output);
    continue;
  } catch {
    // Generate the missing optimized display asset below.
  }

  const result = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', source,
    '-vf', "scale='min(1600,iw)':-2",
    '-c:v', 'libwebp', '-quality', '78', '-compression_level', '6', output,
  ], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Failed to optimize ${source}`);
}

console.log(`Verified optimized WebP display assets for ${images.length} source images.`);
