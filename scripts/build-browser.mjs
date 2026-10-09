// Self-hosted browser ZIP: all artwork, the runtime and the native example pages.
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { staticAssets } from './demo-assets.mjs';
import { assetCatalog, assetPaths } from './package-assets.mjs';
import { resourceFile } from './resource-store.mjs';
import { copyFile } from 'node:fs/promises';
const exec = promisify(execFile), root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
await mkdir(out, { recursive: true });
const browser = path.join(out, 'medieval-ornaments-browser');
await rm(browser, { recursive: true, force: true });
await mkdir(browser);
await cp(path.join(root,'lib'),path.join(browser,'lib'),{recursive:true});
for(const relative of assetPaths(await assetCatalog())) {const target=path.join(browser,relative);await mkdir(path.dirname(target),{recursive:true});await copyFile(resourceFile(relative),target);}
// Native ES-module pages: every image comes from this folder via data-assets-base.
for (const name of ['assets.js', 'demo.js', 'gallery.js', 'site.css', 'playground.css', 'gold-dividers.js', 'gold-dividers.css', 'shared', 'vanilla'])
  await cp(path.join(root, 'examples', name), path.join(browser, 'examples', name), { recursive: true });
for (const name of ['ornaments.css', 'favicon.svg', 'favicon.ico', 'favicon-32.png', 'images.json', 'assets-manifest.json', 'LICENSE']) await cp(path.join(root, name), path.join(browser, name));
for (const name of ['historical-additions.json', 'historical-border-patterns.json', 'illustration-additions.json', 'authored-additions.json']) await cp(path.join(root, name), path.join(browser, name));
const selfHosted = (html, base) => html.replace('<html lang="en">', `<html lang="en" data-assets-base="${base}">`);
for (const name of ['index.html', 'demo.html', 'review.html', 'qa.html']) {
  const target = path.join(browser, 'examples', name);
  let html = selfHosted(await readFile(path.join(root, 'examples', name), 'utf8'), '../');
  if (['review.html', 'qa.html'].includes(name)) html = staticAssets(html, '../').replace(/url\(['"]\.\.\/((?:svg|png|webp)\/[^'"]+)['"]\)/g, "url('$1')");
  await writeFile(target, html);
}
const vanillaPage = path.join(browser, 'examples/vanilla/index.html');
await writeFile(vanillaPage, selfHosted(await readFile(vanillaPage, 'utf8'), '../../'));
await mkdir(path.join(browser, 'docs'));
await cp(path.join(root, 'docs/INTEGRATION.md'), path.join(browser, 'docs/INTEGRATION.md'));
await cp(path.join(root, 'docs/PERFORMANCE.md'), path.join(browser, 'docs/PERFORMANCE.md'));
await cp(path.join(root, 'docs/SELECTIVE.md'), path.join(browser, 'docs/SELECTIVE.md'));
await cp(path.join(root, 'docs/ILLUSTRATIONS.md'), path.join(browser, 'docs/ILLUSTRATIONS.md'));
for(const name of ['RESOURCES.md','RESOURCE-MIGRATION.md'])await cp(path.join(root,'docs',name),path.join(browser,'docs',name));
for (const name of ['SELECTION.md', 'USAGE.md', 'images.schema.json']) await cp(path.join(root, name), path.join(browser, name));
await writeFile(path.join(browser, 'index.html'), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=examples/index.html"><a href="examples/index.html">Open the gallery</a>');
await writeFile(path.join(browser, 'README.txt'), 'Serve this folder over HTTP, for example: python3 -m http.server 8000\nOpen http://localhost:8000/ for the gallery; examples/demo.html and examples/vanilla/ show usage.\nEvery page self-hosts its images from this folder. No React, npm, or build step is needed.\nSee docs/INTEGRATION.md and LICENSE.\n');
// zip is a maintainer tool, never required by consumers.
const zipPath = path.join(out, 'medieval-ornaments-browser.zip');
await rm(zipPath, { force: true });
await exec('zip', ['-q', '-r', zipPath, path.basename(browser)], { cwd: out });
console.log('Built the self-hosted browser ZIP in dist/.');
