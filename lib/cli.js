#!/usr/bin/env node
import { mkdir, readFile, writeFile, realpath, rename, rm, lstat } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ornaments, assetsPackage, assetsVersion, assetsManifestSha256, defaultAssetsBase } from './catalog.js';
import { findOrnaments, getOrnament } from './resolve.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const help = `Usage: medieval-ornaments copy-assets <destination> [--design <name>]... [--format svg|png|webp|all] [--from <directory|http(s)-URL>] [--offline]

Copies selected artwork, variants/components, CSS, catalog and rights notices.
Uses the matching optional asset package when installed; otherwise downloads
only selected files from the version-pinned CDN. Without --design, copies the
complete collection. --offline requires local artwork and makes no requests.
Optional offline install: npm install --save-dev ${assetsPackage}@${assetsVersion}
Example: medieval-ornaments copy-assets public/ornaments --design red-berry-vine
Pass the destination's public URL as assetsBase in your application.
`;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const missing = error => error.code === 'ENOENT' || error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED';
const overlaps = (destination, source) => destination === source || destination.startsWith(source + path.sep) || source.startsWith(destination + path.sep);

async function sourceLocation(from, offline) {
  if (from) {
    if (/^https?:\/\//.test(from)) {
      const url = new URL(from);
      if (url.username || url.password || url.search || url.hash) throw Error('--from URL must not contain credentials, a query or fragment.');
      if (offline) throw Error('--offline requires a local --from directory.');
      return { base: from.replace(/\/+$/, '') + '/' };
    }
    return { directory: await realpath(path.resolve(from)) };
  }
  // Resolve from the consumer too, including pnpm's strict dependency layout.
  for (const entry of [path.join(process.cwd(), 'package.json'), import.meta.url]) {
    try {
      const manifest = createRequire(entry).resolve(assetsPackage + '/package.json');
      const pkg = JSON.parse(await readFile(manifest));
      if (pkg.name === assetsPackage && pkg.version === assetsVersion) return { directory: await realpath(path.dirname(manifest)) };
    } catch (error) { if (!missing(error)) throw error; }
  }
  if (offline) throw Error(`Offline artwork not found. Install ${assetsPackage}@${assetsVersion} or provide --from <directory>.`);
  return { base: defaultAssetsBase };
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
  if (manifest.package !== assetsPackage || manifest.version !== assetsVersion) throw Error('Invalid artwork identity.');
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

export async function main(args) {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) { console.log(help); return; }
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
  const paths = new Set();
  for (const item of items) for (const component of [item, ...Object.values(item.components)]) for (const asset of [component, ...component.variants]) {
    for (const type of formats) if ((format === 'all' || format === type) && asset[type]) paths.add(asset[type]);
  }
  const destination = path.resolve(args[1]);
  const packageRoot = await realpath(root);
  if (overlaps(destination, packageRoot)) throw Error('Choose a destination outside the package directory.');
  const source = await sourceLocation(from, offline);
  await mkdir(destination, { recursive: true });
  const resolved = await realpath(destination);
  if (overlaps(resolved, packageRoot) || (source.directory && overlaps(resolved, source.directory))) throw Error('Choose a destination outside the package directory and artwork source.');
  const manifest = await readManifest(source);
  const queue = [...paths];
  // Stream four files at a time. Never retain a full trace/archive in memory.
  // Await every worker even on failure so callers cannot race unfinished writes.
  let stopped = false;
  const workers = await Promise.allSettled(Array.from({ length: 4 }, async () => {
    try {
      while (!stopped && queue.length) {
        const relative = queue.shift();
        const expected = manifest.files[relative];
        if (!expected) throw Error(`Asset absent from pinned manifest: ${relative}`);
        await writeVerified(source, relative, expected, await safeTarget(resolved, relative));
      }
    } catch (error) { stopped = true; throw error; }
  }));
  const failure = workers.find(worker => worker.status === 'rejected');
  if (failure) throw failure.reason;
  for (const relative of ['ornaments.css', 'LICENSE', 'ASSET-RIGHTS.md']) {
    await writeFile(await safeTarget(resolved, relative), await readFile(path.join(root, relative)));
  }
  const catalog = JSON.parse(JSON.stringify(items));
  if (format !== 'all') for (const item of catalog) {
    item.formats = item.formats.filter(type => type === format);
    for (const component of [item, ...Object.values(item.components)]) for (const asset of [component, ...component.variants]) {
      for (const type of formats) if (type !== format) { delete asset[type]; delete asset[type + '_bytes']; }
    }
  }
  await writeFile(await safeTarget(resolved, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
  console.log(`Copied ${items.length} designs and ${paths.size} verified artwork files from ${source.directory || source.base} to ${resolved}. Set assetsBase to its public URL.`);
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
