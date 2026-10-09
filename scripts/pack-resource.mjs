// Deterministic resource tarball in delivery order. npm's own pack sorts
// entries alphabetically, which puts every default WebP behind all PNG and SVG
// files; CDNs that read the tarball sequentially then pay for that offset.
// The published file set is identical to `npm pack`; only the order differs.
import { readFile, writeFile, stat, mkdir, rm } from 'node:fs/promises';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { registry, designPaths } from './resource-store.mjs';

const exec = promisify(execFile);
const metadataOrder = ['package.json', 'README.md', 'LICENSE', 'catalog.json', 'resource-manifest.json'];

// Default formats first (WebP, and SVG for vector reconstructions), smallest
// size tier first; optional PNG and color-trace SVG alternatives last.
export function deliveryOrder(files, designs) {
  const vector = new Set(Object.values(designs).filter(item => item.derivation === 'vector-reconstruction')
    .flatMap(designPaths).filter(relative => relative.startsWith('svg/')));
  const key = relative => {
    const [format, folder] = relative.split('/');
    const rank = format === 'webp' ? 0 : vector.has(relative) ? 1 : format === 'png' ? 2 : 3;
    const tier = /^\d+$/.test(folder) && relative.split('/').length === 3 ? Number(folder) : Infinity;
    return [rank, tier];
  };
  return [...files].sort((a, b) => {
    const [ra, ta] = key(a), [rb, tb] = key(b);
    return ra - rb || ta - tb || (a < b ? -1 : a > b ? 1 : 0);
  });
}

async function npmFileSet(directory) {
  const { stdout } = await exec('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: directory, maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(stdout)[0].files.map(file => file.path).sort();
}

export async function packResource(id, directory, output) {
  const config = registry(), pkg = JSON.parse(await readFile(path.join(directory, 'package.json')));
  const data = JSON.parse(await readFile(path.join(directory, 'resource-manifest.json')));
  if (data.id !== id || pkg.name !== config.sources[id]?.package) throw Error(`Checkout is not resource ${id}.`);
  const publicFiles = deliveryOrder(Object.keys(data.files), data.designs);
  const entries = [...metadataOrder.filter(name => name === 'README.md' || name === 'package.json' || pkg.files.includes(name)), ...publicFiles];
  const expected = await npmFileSet(directory);
  if (JSON.stringify([...entries].sort()) !== JSON.stringify(expected)) throw Error(`Delivery tarball differs from npm's file set for ${id}.`);
  let unpackedSize = 0;
  for (const relative of entries) unpackedSize += (await stat(path.join(directory, relative))).size;
  const list = path.join(tmpdir(), `ornament-pack-${id}-${process.pid}.txt`);
  await writeFile(list, entries.join('\n') + '\n');
  await mkdir(path.dirname(output), { recursive: true });
  // GNU tar keeps the list order; fixed owners/modes/mtime and gzip -n make
  // the bytes reproducible. npm uses the same 1985-10-26 timestamp.
  await new Promise((resolve, reject) => {
    const tar = spawn('tar', ['--create', '--format=ustar', '--no-recursion', '--owner=0', '--group=0', '--numeric-owner',
      '--mode=u=rw,go=r', '--mtime=1985-10-26 08:15:00Z', '--transform=s,^,package/,', '-C', directory, '-T', list, '-f', '-']);
    const gzip = spawn('gzip', ['-n', '-9']);
    const out = [];
    tar.stdout.pipe(gzip.stdin);
    gzip.stdout.on('data', chunk => out.push(chunk));
    let failed = '';
    for (const child of [tar, gzip]) child.stderr.on('data', chunk => { failed += chunk; });
    gzip.on('close', async code => {
      if (code !== 0 || failed) return reject(Error(`tar/gzip failed for ${id}: ${failed}`));
      await writeFile(output, Buffer.concat(out)); resolve();
    });
    tar.on('error', reject); gzip.on('error', reject);
  });
  await rm(list, { force: true });
  const size = (await stat(output)).size, policy = config.policy;
  const result = { id, name: pkg.name, version: pkg.version, file: output, size, unpackedSize, entries: entries.length,
    firstPublic: publicFiles[0], lastPublic: publicFiles.at(-1) };
  if (size > policy.maxNpmPackedBytes) throw Error(`Compressed upload ${size} B exceeds ${policy.maxNpmPackedBytes} B; split the source before publishing.`);
  if (unpackedSize > policy.maxNpmUnpackedBytes) throw Error(`Unpacked package ${unpackedSize} B exceeds ${policy.maxNpmUnpackedBytes} B (jsDelivr headroom); split the source before publishing.`);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [id, directory, output] = process.argv.slice(2);
  if (!id || !directory || !output) throw Error('Usage: node scripts/pack-resource.mjs <source-id> <checkout> <output.tgz>');
  console.log(JSON.stringify(await packResource(id, path.resolve(directory), path.resolve(output)), null, 2));
}
