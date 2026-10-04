#!/usr/bin/env node
import { mkdir, readFile, writeFile, realpath, rename, rm, lstat } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ornaments } from './catalog.js';
import { version, assetsPackage, assetsVersion, assetsManifestSha256, defaultAssetsBase, illustrationsPackage, illustrationsVersion, defaultIllustrationsBase } from './runtime.js';
import { designData, vanillaModule, reactModule, styledModule, vanillaTypes, reactTypes } from './module-templates.js';
import { createDesignResolver } from './bind-design.js';
import { findOrnaments, getOrnament } from './resolve.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const help = `Usage: medieval-ornaments add <design>... [--out src/ornaments] [--assets public/ornaments]
  [--assets-base /ornaments/] [--framework react|vanilla] [--format auto|svg|png|webp|all]
  [--from <directory|http(s)-URL>] [--offline] [--overwrite]

Adds selected component code and verified artwork to your project. Defaults:
React, src/ornaments, public/ornaments, /ornaments/, auto (SVG for vector
reconstructions; WebP for painted designs). Existing edited files require
--overwrite. The copied code has no dependency on this runtime package.
Import from ./ornaments/<design>.js; omit the design prop. For Node SSR,
React has ./ornaments/<design>.unstyled.js (load CSS in your browser entry).
Documentation: docs/SELECTIVE.md in the package or the repository.

Usage: medieval-ornaments copy-assets <destination> [--design <name>]... [--format svg|png|webp|all] [--from <directory|http(s)-URL>] [--offline]

Copies selected artwork, variants/components, CSS, catalog and rights notices.
Uses the matching optional asset package when installed; otherwise downloads
only selected files from the version-pinned CDN. Without --design, copies the
complete collection. --offline requires local artwork and makes no requests.
Optional full offline install: npm install --save-dev ${assetsPackage}@${assetsVersion}
Illustrations only: npm install --save-dev ${illustrationsPackage}@${illustrationsVersion}
Example: medieval-ornaments copy-assets public/ornaments --design red-berry-vine
Pass the destination's public URL as assetsBase in your application.
`;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const artworkPackages = [{package:assetsPackage,version:assetsVersion,base:defaultAssetsBase},{package:illustrationsPackage,version:illustrationsVersion,base:defaultIllustrationsBase}];
const missing = error => error.code === 'ENOENT' || error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED';
const overlaps = (destination, source) => destination === source || destination.startsWith(source + path.sep) || source.startsWith(destination + path.sep);

async function installedSource(pin) {
  // Resolve from the consumer too, including pnpm's strict dependency layout.
  const entries = [path.join(process.cwd(), 'package.json'), import.meta.url];
  if (pin.package === illustrationsPackage) {
    // pnpm may expose illustrations only beneath the full artwork package.
    for (const entry of [...entries]) {
      try { entries.push(createRequire(entry).resolve(assetsPackage + '/package.json')); }
      catch (error) { if (!missing(error)) throw error; }
    }
  }
  for (const entry of entries) {
    try {
      const manifest = createRequire(entry).resolve(pin.package + '/package.json');
      const pkg = JSON.parse(await readFile(manifest));
      if (pkg.name === pin.package && pkg.version === pin.version) return { directory: await realpath(path.dirname(manifest)) };
    } catch (error) { if (!missing(error)) throw error; }
  }
}

async function sourceLocation(from, offline, items) {
  if (from) {
    if (/^https?:\/\//.test(from)) {
      const url = new URL(from);
      if (url.username || url.password || url.search || url.hash) throw Error('--from URL must not contain credentials, a query or fragment.');
      if (offline) throw Error('--offline requires a local --from directory.');
      return { base: from.replace(/\/+$/, '') + '/' };
    }
    return { directory: await realpath(path.resolve(from)) };
  }
  const needed = new Set(items.map(item => item.asset_type === 'illustration' ? illustrationsPackage : assetsPackage));
  const locations = {};
  for (const pin of artworkPackages.filter(pin => needed.has(pin.package))) {
    let source = await installedSource(pin);
    if (!source && offline) throw Error(`Offline artwork not found. Install ${pin.package}@${pin.version} or provide --from <directory>.`);
    locations[pin.package] = source || { base: pin.base };
  }
  // Both archives contain the same pinned manifest for the unified collection.
  return { ...Object.values(locations)[0], locations };
}

async function response(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (result.ok) return result;
      await result.body?.cancel();
      if (result.status >= 500 && attempt < 2) continue;
      throw Error(`HTTP ${result.status} loading ${url}`);
    } catch (error) {
      if (attempt === 2 || /HTTP /.test(error.message)) throw error;
    }
  }
}

async function readManifest(source) {
  let bytes;
  if (source.directory) bytes = await readFile(path.join(source.directory, 'assets-manifest.json'));
  else {
    const result = await response(source.base + 'assets-manifest.json');
    const chunks = []; let size = 0;
    for await (const chunk of Readable.fromWeb(result.body)) {
      size += chunk.length;
      if (size > 1024 * 1024) throw Error('Asset manifest exceeds 1 MB.');
      chunks.push(chunk);
    }
    bytes = Buffer.concat(chunks);
  }
  if (sha256(bytes) !== assetsManifestSha256) throw Error(`Source manifest does not match pinned ${assetsPackage}@${assetsVersion}.`);
  const manifest = JSON.parse(bytes);
  if (manifest.package !== assetsPackage || manifest.version !== assetsVersion || manifest.illustrations?.package !== illustrationsPackage || manifest.illustrations?.version !== illustrationsVersion) throw Error('Invalid artwork identity.');
  return manifest;
}

async function safeTarget(destination, relative) {
  const target = path.join(destination, relative);
  let parent = destination;
  for (const segment of relative.split('/').slice(0, -1)) {
    parent = path.join(parent, segment);
    try { await mkdir(parent); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const actual = await realpath(parent);
    if (actual !== destination && !actual.startsWith(destination + path.sep)) throw Error('Destination contains a symlink outside its root.');
  }
  try {
    if ((await lstat(target)).isSymbolicLink()) throw Error('Destination file is a symlink.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  return target;
}

async function writeVerified(source, relative, expected, target) {
  const temporary = target + '.ornament-' + randomUUID();
  const hash = createHash('sha256'); let bytes = 0;
  try {
    const input = source.directory ? createReadStream(path.join(source.directory, relative)) : Readable.fromWeb((await response(source.base + relative)).body);
    const count = new Transform({ transform(chunk, _encoding, done) {
      bytes += chunk.length; hash.update(chunk);
      if (bytes > expected.bytes) done(Error(`Asset size mismatch: ${relative}`));
      else done(null, chunk);
    } });
    await pipeline(input, count, createWriteStream(temporary, { flags: 'wx' }));
    if (bytes !== expected.bytes || hash.digest('hex') !== expected.sha256) throw Error(`Asset integrity mismatch: ${relative}`);
    await rename(temporary, target);
  } finally { await rm(temporary, { force: true }); }
}

async function destinationRoot(value, source) {
  const destination = path.resolve(value), packageRoot = await realpath(root);
  if (overlaps(destination, packageRoot)) throw Error('Choose a destination outside the package directory.');
  await mkdir(destination, { recursive: true });
  const resolved = await realpath(destination);
  if (overlaps(resolved, packageRoot) || Object.values(source.locations || {source}).some(location => location.directory && overlaps(resolved, location.directory))) throw Error('Choose a destination outside the package directory and artwork source.');
  return resolved;
}

function filteredCatalog(items, selections) {
  const catalog = JSON.parse(JSON.stringify(items));
  for (const item of catalog) {
    item.formats = item.formats.filter(type => selections[item.name].includes(type));
    for (const component of [item, ...Object.values(item.components)]) for (const asset of [component, ...component.variants]) {
      for (const type of ['svg', 'png', 'webp']) if (!item.formats.includes(type)) { delete asset[type]; delete asset[type + '_bytes']; }
    }
  }
  return catalog;
}

async function copyArtwork(items, selections, source, resolved, manifest, protect = false, overwrite = false) {
  const paths = new Set();
  for (const item of items) for (const component of [item, ...Object.values(item.components)]) for (const asset of [component, ...component.variants]) {
    for (const type of selections[item.name]) if (asset[type]) paths.add(asset[type]);
  }
  const queue = [];
  for (const relative of paths) {
    const expected = manifest.files[relative];
    if (!expected) throw Error(`Asset absent from pinned manifest: ${relative}`);
    const target = await safeTarget(resolved, relative);
    if (protect) {
      try {
        if (sha256(await readFile(target)) === expected.sha256) continue;
        if (!overwrite) throw Error(`Existing artwork differs: ${target}. Use --overwrite to replace it.`);
      } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    queue.push(relative);
  }
  let stopped = false;
  const workers = await Promise.allSettled(Array.from({ length: 4 }, async () => {
    try {
      while (!stopped && queue.length) {
        const relative = queue.shift();
        const expected = manifest.files[relative];
        const location = source.locations ? source.locations[expected.package || assetsPackage] : source;
        if (!location) throw Error(`No verified artwork source for ${relative}.`);
        await writeVerified(location, relative, expected, await safeTarget(resolved, relative));
      }
    } catch (error) { stopped = true; throw error; }
  }));
  const failure = workers.find(worker => worker.status === 'rejected');
  if (failure) throw failure.reason;
  return paths.size;
}

async function preflight(files, overwrite) {
  for (const [target, contents] of files) {
    try {
      if ((await readFile(target)).equals(Buffer.from(contents))) continue;
      if (!overwrite) throw Error(`Existing file differs: ${target}. Use --overwrite only if you want to replace your edits.`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

async function addComponents(args) {
  const names = [], options = { out: 'src/ornaments', assets: 'public/ornaments', 'assets-base': '/ornaments/', framework: 'react', format: 'auto' };
  let offline = false, overwrite = false;
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (!flag.startsWith('--')) { names.push(getOrnament(flag).name); continue; }
    if (flag === '--offline') { offline = true; continue; }
    if (flag === '--overwrite') { overwrite = true; continue; }
    const key = flag.slice(2), value = args[++i];
    if (!(Object.hasOwn(options, key) || key === 'from') || !value || value.startsWith('--')) throw Error(`Invalid argument or missing value: ${flag}.\n${help}`);
    options[key] = value;
  }
  if (!names.length) throw Error('add requires at least one design name.\n' + help);
  if (!['react', 'vanilla'].includes(options.framework)) throw Error('--framework must be react or vanilla.');
  if (!['auto', 'all', 'svg', 'png', 'webp'].includes(options.format)) throw Error('--format must be auto, all, svg, png or webp.');
  const selected = [...new Set(names)].map(getOrnament), selections = {};
  for (const item of selected) {
    const format = options.format === 'auto' ? item.derivation === 'vector-reconstruction' ? 'svg' : 'webp' : options.format;
    if (format !== 'all' && !item.formats.includes(format)) throw Error(`${item.name} does not support ${format}.`);
    selections[item.name] = format === 'all' ? item.formats : [format];
    // Validate the hosting URL before filesystem writes or network requests.
    createDesignResolver(item)(item.uses[0], { assetsBase: options['assets-base'] });
  }
  const source = await sourceLocation(options.from, offline, selected);
  const out = await destinationRoot(options.out, source), assets = await destinationRoot(options.assets, source);
  if (overlaps(out, assets)) throw Error('--out and --assets must be separate directories without overlap.');
  const marker = await safeTarget(out, 'installation.json');
  let previous;
  try { previous = JSON.parse(await readFile(marker, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const config = { runtimeVersion: version, assetsPackage, assetsVersion, illustrationsPackage, illustrationsVersion, framework: options.framework, assetsBase: options['assets-base'], assetsDirectory: path.relative(out, assets) };
  if (previous && (previous.schema !== 1 || JSON.stringify(previous.configuration) !== JSON.stringify(config))) throw Error('Existing installation uses a different version, framework or hosting configuration. Choose a fresh --out directory (and --assets when changing artwork versions).');
  const combined = { ...(previous?.designs || {}) };
  for (const [name, formats] of Object.entries(selections)) combined[name] = [...new Set([...(combined[name] || []), ...formats])].sort();
  const items = Object.keys(combined).sort().map(getOrnament), catalog = filteredCatalog(items, combined), files = new Map();
  const put = async (relative, content) => {
    const target = await safeTarget(out, relative);
    const belongsToRequestedDesign = selected.some(item => relative.includes(item.name));
    if (!overwrite && !belongsToRequestedDesign && previous?.files?.[relative] === sha256(content)) {
      try { await lstat(target); return; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    files.set(target, content);
  };
  const helpers = ['runtime.js', 'freeze.js', 'bind-design.js', 'resolve-core.js', 'vanilla-core.js', 'visibility.js', 'common.d.ts'];
  if (options.framework === 'react') helpers.push('react-core.js', 'react-core.d.ts');
  for (const helper of helpers) await put('lib/' + helper, await readFile(path.join(root, 'lib', helper)));
  for (const relative of ['ornaments.css', 'LICENSE', 'ASSET-RIGHTS.md']) await put(relative, await readFile(path.join(root, relative)));
  await put('package.json', JSON.stringify({ private: true, type: 'module', sideEffects: ['**/*.css', './*.js', './lib/react-designs/*-styled.js'] }, null, 2) + '\n');
  await put('styles.d.ts', "declare module '*.css';\n");
  for (const item of catalog) {
    const defaults = { assetsBase: options['assets-base'] };
    await put(`lib/design-data/${item.name}.js`, designData(item));
    await put(`lib/designs/${item.name}.js`, vanillaModule(item, defaults));
    await put(`lib/designs/${item.name}.d.ts`, vanillaTypes(item));
    if (options.framework === 'react') {
      await put(`lib/react-designs/${item.name}.js`, reactModule(item, defaults));
      await put(`lib/react-designs/${item.name}.d.ts`, reactTypes(item));
      await put(`lib/react-designs/${item.name}-styled.js`, styledModule(item.name));
      await put(`${item.name}.js`, `'use client';\nexport * from './lib/react-designs/${item.name}-styled.js';\n`);
      await put(`${item.name}.unstyled.js`, `'use client';\nexport * from './lib/react-designs/${item.name}.js';\n`);
      await put(`${item.name}.d.ts`, `/// <reference path="./styles.d.ts" />\nexport * from './lib/react-designs/${item.name}.js';\n`);
      await put(`${item.name}.unstyled.d.ts`, `export * from './lib/react-designs/${item.name}.js';\n`);
    } else {
      await put(`${item.name}.js`, `export * from './lib/designs/${item.name}.js';\n`);
      await put(`${item.name}.d.ts`, `export * from './lib/designs/${item.name}.js';\n`);
    }
  }
  await preflight(files, overwrite);
  const notices = new Map();
  for (const relative of ['ornaments.css', 'LICENSE', 'ASSET-RIGHTS.md']) notices.set(await safeTarget(assets, relative), await readFile(path.join(root, relative)));
  // Only an existing installation owns the incrementally expanded asset catalog.
  const catalogTarget = await safeTarget(assets, 'catalog.json'), catalogText = JSON.stringify(catalog, null, 2) + '\n';
  if (!previous) notices.set(catalogTarget, catalogText);
  else {
    const priorItems = Object.keys(previous.designs).sort().map(getOrnament);
    const priorText = JSON.stringify(filteredCatalog(priorItems, previous.designs), null, 2) + '\n';
    await preflight(new Map([[catalogTarget, priorText]]), overwrite);
  }
  await preflight(notices, overwrite);
  const manifest = await readManifest(source);
  const count = await copyArtwork(selected, selections, source, assets, manifest, true, overwrite);
  for (const [target, content] of [...files, ...notices]) await writeFile(target, content);
  await writeFile(catalogTarget, catalogText);
  const installation = { schema: 1, configuration: config, designs: combined, files: { ...(previous?.files || {}), ...Object.fromEntries([...files].map(([file, bytes]) => [path.relative(out, file), sha256(bytes)])) } };
  const temporary = marker + '.ornament-' + randomUUID();
  try { await writeFile(temporary, JSON.stringify(installation, null, 2) + '\n', { flag: 'wx' }); await rename(temporary, marker); }
  finally { await rm(temporary, { force: true }); }
  console.log(`Added ${selected.length} ${options.framework} designs (${count} verified artwork files) to ${out}; public assets: ${assets}. Import ./<design>.js; omit design. Hosting URL: ${options['assets-base']}`);
}

export async function main(args) {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) { console.log(help); return; }
  if (args[0] === 'add') return addComponents(args.slice(1));
  if (args[0] !== 'copy-assets' || !args[1] || args[1].startsWith('--')) throw Error(help);
  const names = [], formats = ['svg', 'png', 'webp'];
  let format = 'all', from, offline = false;
  for (let i = 2; i < args.length; i++) {
    const flag = args[i];
    if (flag === '--offline') { offline = true; continue; }
    const value = args[++i];
    if (!value || value.startsWith('--')) throw Error(`Missing value for ${flag}.`);
    if (flag === '--design') names.push(getOrnament(value).name);
    else if (flag === '--format' && [...formats, 'all'].includes(value)) format = value;
    else if (flag === '--from') from = value;
    else throw Error(`Invalid argument: ${flag} ${value}.\n${help}`);
  }
  const items = names.length ? findOrnaments().filter(item => names.includes(item.name)) : ornaments;
  if (format !== 'all' && items.some(item => !item.formats.includes(format))) throw Error(`Some selected designs do not support ${format}. Select compatible designs with --design or use --format all.`);
  const selections = Object.fromEntries(items.map(item => [item.name, format === 'all' ? item.formats : [format]]));
  const source = await sourceLocation(from, offline, items);
  const resolved = await destinationRoot(args[1], source);
  const manifest = await readManifest(source);
  const count = await copyArtwork(items, selections, source, resolved, manifest);
  for (const relative of ['ornaments.css', 'LICENSE', 'ASSET-RIGHTS.md']) {
    await writeFile(await safeTarget(resolved, relative), await readFile(path.join(root, relative)));
  }
  await writeFile(await safeTarget(resolved, 'catalog.json'), JSON.stringify(filteredCatalog(items, selections), null, 2) + '\n');
  console.log(`Copied ${items.length} designs and ${count} verified artwork files from ${source.directory || source.base} to ${resolved}. Set assetsBase to its public URL.`);
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
