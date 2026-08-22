import { mkdir, readFile, writeFile } from 'node:fs/promises';

const bundlePath = 'public/assets/js/site.min.js';
let bundle = await readFile(bundlePath, 'utf8');
const urls = [...new Set(bundle.match(/https:\/\/readdy\.ai\/api\/search-image\?[^`"]+/g) ?? [])];

await mkdir('public/assets/media', { recursive: true });

for (let index = 0; index < urls.length; index += 1) {
  const url = urls[index];
  const sequence = new URL(url).searchParams.get('seq') ?? `image-${index + 1}`;
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`Could not download ${sequence}: ${response.status}`);

  const contentType = response.headers.get('content-type') ?? '';
  const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const localPath = `/assets/media/${sequence}.${extension}`;
  await writeFile(`public${localPath}`, Buffer.from(await response.arrayBuffer()));
  bundle = bundle.replaceAll(url, localPath);
  console.log(`Localized ${sequence}`);
}

await writeFile(bundlePath, bundle);
console.log(`Localized ${urls.length} generated images.`);
