// Native browser ZIP, plus a locally bundled React example for GitHub Pages.
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { build } from 'vite';
const exec = promisify(execFile), root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
await mkdir(out, { recursive: true });
const browser = path.join(out, 'medieval-ornaments-browser');
await rm(browser, { recursive: true, force: true });
await mkdir(browser);
for (const folder of ['lib', 'svg', 'png', 'webp']) await cp(path.join(root, folder), path.join(browser, folder), { recursive: true });
for (const name of ['ornaments.css', 'favicon.svg', 'LICENSE', 'ASSET-RIGHTS.md']) await cp(path.join(root, name), path.join(browser, name));
await cp(path.join(root, 'examples/vanilla'), path.join(browser, 'examples/vanilla'), { recursive: true });
const vanillaPage = path.join(browser, 'examples/vanilla/index.html');
await writeFile(vanillaPage, (await readFile(vanillaPage, 'utf8')).replace('<a href="../react/">React example</a>', '').replace('<a href="../">Design browser</a>', '').replace('<a href="../../medieval-ornaments-browser.zip">Browser ZIP</a>', ''));
await cp(path.join(root, 'examples/integration.css'), path.join(browser, 'examples/integration.css'));
await mkdir(path.join(browser, 'docs'));
await cp(path.join(root, 'docs/INTEGRATION.md'), path.join(browser, 'docs/INTEGRATION.md'));
await writeFile(path.join(browser, 'index.html'), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=examples/vanilla/"><a href="examples/vanilla/">Vanilla example</a>');
await writeFile(path.join(browser, 'README.txt'), 'Serve this folder over HTTP, for example: python3 -m http.server 8000\nOpen http://localhost:8000/\nThe example self-hosts its images. No React, npm, or build step is needed.\nSee docs/INTEGRATION.md and ASSET-RIGHTS.md.\n');
// zip is a maintainer tool, never required by consumers.
const zipPath = path.join(out, 'medieval-ornaments-browser.zip');
await rm(zipPath, { force: true });
await exec('zip', ['-q', '-r', zipPath, path.basename(browser)], { cwd: out });
const base = process.env.ORNAMENTS_SITE_BASE || '/medieval-ornaments/';
const assetsRoot = base.replace(/\/$/, '') + '/';
await build({ configFile: false, root: path.join(root, 'examples/react'), base: `${assetsRoot}examples/react/`,
  plugins: [{ name: 'self-host-example', transformIndexHtml: html => html.replace('<html lang="en">', `<html lang="en" data-assets-base="${assetsRoot}">`) }],
  build: { outDir: path.join(out, 'react'), emptyOutDir: true }, logLevel: 'warn' });
console.log('Built browser ZIP and self-hosted React example in dist/.');
