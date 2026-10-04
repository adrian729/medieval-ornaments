// Native browser ZIP, plus a locally bundled React example for GitHub Pages.
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
await cp(path.join(root,'examples/assets.js'),path.join(browser,'examples/assets.js'));
for (const name of ['ornaments.css', 'favicon.svg', 'favicon.ico', 'favicon-32.png', 'images.json', 'assets-manifest.json', 'LICENSE', 'ASSET-RIGHTS.md']) await cp(path.join(root, name), path.join(browser, name));
for (const name of ['index.html', 'demo.html', 'review.html', 'qa.html']) {
  const target = path.join(browser, 'examples', name);
  await cp(path.join(root, 'examples', name), target);
  await writeFile(target, staticAssets((await readFile(target, 'utf8')).replace('<html lang="en">','<html lang="en" data-assets-base="../">'), '../').replace(/url\(['"]\.\.\/((?:svg|png|webp)\/[^'"]+)['"]\)/g,"url('$1')").replace(/<a href="react\/">[^<]*<\/a>/g, ''));
}
await cp(path.join(root, 'examples/vanilla'), path.join(browser, 'examples/vanilla'), { recursive: true });
const vanillaPage = path.join(browser, 'examples/vanilla/index.html');
await writeFile(vanillaPage, (await readFile(vanillaPage, 'utf8')).replace('<html lang="en">','<html lang="en" data-assets-base="../../">').replace('<a href="../react/">React example</a>', '').replace('<a href="../../medieval-ornaments-browser.zip">Browser ZIP</a>', ''));
await cp(path.join(root, 'examples/integration.css'), path.join(browser, 'examples/integration.css'));
await mkdir(path.join(browser, 'docs'));
await cp(path.join(root, 'docs/INTEGRATION.md'), path.join(browser, 'docs/INTEGRATION.md'));
await cp(path.join(root, 'docs/PERFORMANCE.md'), path.join(browser, 'docs/PERFORMANCE.md'));
await cp(path.join(root, 'docs/SELECTIVE.md'), path.join(browser, 'docs/SELECTIVE.md'));
await cp(path.join(root, 'docs/ILLUSTRATIONS.md'), path.join(browser, 'docs/ILLUSTRATIONS.md'));
for(const name of ['RESOURCES.md','RESOURCE-MIGRATION.md'])await cp(path.join(root,'docs',name),path.join(browser,'docs',name));
for (const name of ['SELECTION.md', 'USAGE.md', 'images.schema.json']) await cp(path.join(root, name), path.join(browser, name));
await writeFile(path.join(browser, 'index.html'), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=examples/vanilla/"><a href="examples/vanilla/">Vanilla example</a>');
await writeFile(path.join(browser, 'README.txt'), 'Serve this folder over HTTP, for example: python3 -m http.server 8000\nOpen http://localhost:8000/\nThe example self-hosts its images. No React, npm, or build step is needed.\nSee docs/INTEGRATION.md and ASSET-RIGHTS.md.\n');
// zip is a maintainer tool, never required by consumers.
const zipPath = path.join(out, 'medieval-ornaments-browser.zip');
await rm(zipPath, { force: true });
await exec('zip', ['-q', '-r', zipPath, path.basename(browser)], { cwd: out });
await import('./build-react.mjs');
console.log('Built offline browser ZIP and CDN React demo in dist/.');
