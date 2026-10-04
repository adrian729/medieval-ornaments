// Assemble the actual deployment, retaining public artwork and reference sources.
import { cp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const site = path.join(root, 'dist/site');
await rm(site, { recursive: true, force: true });
await mkdir(site, { recursive: true });
for (const directory of ['examples', 'lib', 'svg', 'png', 'webp', 'docs']) {
  await cp(path.join(root, directory), path.join(site, directory), { recursive: true });
}
await mkdir(path.join(site, 'sources'));
for (const entry of await readdir(path.join(root, 'sources'), { withFileTypes: true })) {
  // Checked-in editable trace masters duplicate the public SVG exports. They
  // remain in Git; neither the browser nor source/reference audit links need them.
  if (entry.name === 'traces') continue;
  await cp(path.join(root, 'sources', entry.name), path.join(site, 'sources', entry.name), { recursive: true });
}
const files = ['index.html', 'ornaments.css', 'favicon.svg', 'favicon-32.png', 'favicon.ico',
  'images.json', 'images.schema.json', 'illustrations.json', 'illustration-import.json',
  'selection-metadata.json', 'assets-manifest.json', 'LICENSE', 'source-patterns.json',
  'additional-patterns.json', 'reference-crops.json', 'raster-metadata.json', 'EXTRACTION-PROMPTS.json',
  ...(await readdir(root)).filter(name => name.endsWith('.md'))];
for (const name of files) await cp(path.join(root, name), path.join(site, name));
await cp(path.join(root, 'dist/react'), path.join(site, 'examples/react'), { recursive: true });
await cp(path.join(root, 'dist/medieval-ornaments-browser.zip'), path.join(site, 'medieval-ornaments-browser.zip'));
await writeFile(path.join(site, '.nojekyll'), '');
async function bytes(directory) {
  const totals = await Promise.all((await readdir(directory, { withFileTypes: true })).map(async entry =>
    entry.isDirectory() ? bytes(path.join(directory, entry.name)) : (await stat(path.join(directory, entry.name))).size));
  return totals.reduce((sum, value) => sum + value, 0);
}
const total = await bytes(site);
// GitHub Pages limits the published site to 1 GB. Keep measurable headroom.
if (total >= 950_000_000) throw Error(`Published site is ${total} bytes, above the 950 MB deployment budget. Move optional archives to release hosting before adding more data.`);
await mkdir(path.join(root, 'tmp'), { recursive: true });
await writeFile(path.join(root, 'tmp/site-build.json'), JSON.stringify({ bytes: total, excludedSourceDirectory: 'sources/traces', budget: 950_000_000 }) + '\n');
console.log(`Assembled GitHub Pages site: ${total} bytes; reference sources retained, editable traces remain in Git.`);
