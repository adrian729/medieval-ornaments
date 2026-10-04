// Assemble lightweight demos/reference sources; artwork and archives stay external.
import { cp, mkdir, readdir, rm, stat, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { staticAssets } from './demo-assets.mjs';
import { ownedPaths } from './resource-store.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const site = path.join(root, 'dist/site');
await rm(site, { recursive: true, force: true });
await mkdir(site, { recursive: true });
for (const directory of ['examples', 'lib', 'docs']) {
  await cp(path.join(root, directory), path.join(site, directory), { recursive: true });
}
await mkdir(path.join(site, 'sources'));
for (const entry of await readdir(path.join(root, 'sources'), { withFileTypes: true })) {
  // Canonical native inputs and traces belong to resource repositories.
  // Local aliases must never be uploaded to Pages.
  if (['traces','tiles'].includes(entry.name)) continue;
  await cp(path.join(root, 'sources', entry.name), path.join(site, 'sources', entry.name), { recursive: true, filter: source => !ownedPaths().has(path.relative(root,source).split(path.sep).join('/')) });
}
const files = ['index.html', 'ornaments.css', 'favicon.svg', 'favicon-32.png', 'favicon.ico',
  'images.json', 'images.schema.json', 'illustrations.json', 'illustration-import.json',
  'selection-metadata.json', 'assets-manifest.json', 'LICENSE', 'source-patterns.json',
  'additional-patterns.json', 'reference-crops.json', 'raster-metadata.json', 'EXTRACTION-PROMPTS.json',
  ...(await readdir(root)).filter(name => name.endsWith('.md'))];
for (const name of files) await cp(path.join(root, name), path.join(site, name));
await cp(path.join(root, 'dist/react'), path.join(site, 'examples/react'), { recursive: true });
const pkg=JSON.parse(await readFile(path.join(root,'package.json')));
const archive=`https://github.com/adrian729/medieval-ornaments/releases/download/v${pkg.version}/medieval-ornaments-browser.zip`;
for(const relative of ['examples/demo.html','examples/index.html','examples/review.html','examples/qa.html','examples/vanilla/index.html']) {
 const target=path.join(site,relative);let html=staticAssets(await readFile(target,'utf8'));
 html=html.replace('../../medieval-ornaments-browser.zip',archive);await writeFile(target,html);
}
await writeFile(path.join(site, '.nojekyll'), '');
async function bytes(directory) {
  const totals = await Promise.all((await readdir(directory, { withFileTypes: true })).map(async entry =>
    entry.isDirectory() ? bytes(path.join(directory, entry.name)) : (await stat(path.join(directory, entry.name))).size));
  return totals.reduce((sum, value) => sum + value, 0);
}
const total = await bytes(site);
// GitHub Pages limits the published site to 1 GB. Keep measurable headroom.
if (total >= 50_000_000) throw Error(`Published site is ${total} bytes, above the 50 MB lightweight-site budget. Resources belong in the registered asset repositories/CDN, and ZIPs in Releases.`);
await mkdir(path.join(root, 'tmp'), { recursive: true });
await writeFile(path.join(root, 'tmp/site-build.json'), JSON.stringify({ bytes: total, externalResources: true, releaseArchive: archive, budget: 50_000_000 }) + '\n');
console.log(`Assembled GitHub Pages site: ${total} bytes; reference sources retained; artwork uses pinned CDN, ZIP uses Releases.`);
