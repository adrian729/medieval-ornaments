#!/usr/bin/env node
import { mkdir, copyFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ornaments } from './catalog.js';
import { findOrnaments, getOrnament } from './resolve.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const help = `Usage: medieval-ornaments copy-assets <destination> [--design <name>]... [--format svg|png|webp|all]

Copies the selected designs and their components/variants, the shared CSS, a
filtered catalog.json, and rights notices. Without --design, copies all designs.
Pass the destination's public URL as assetsBase in your application.
Example: medieval-ornaments copy-assets public/ornaments --design red-berry-vine
`;

export async function main(args) {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) { console.log(help); return; }
  if (args[0] !== 'copy-assets' || !args[1] || args[1].startsWith('--')) throw new Error(help);
  const names = [], formats = ['svg', 'png', 'webp'];
  let format = 'all';
  for (let i = 2; i < args.length; i++) {
    const flag = args[i], value = args[++i];
    if (!value) throw new Error(`Missing value for ${flag}.`);
    if (flag === '--design') names.push(getOrnament(value).name);
    else if (flag === '--format' && [...formats, 'all'].includes(value)) format = value;
    else throw new Error(`Invalid argument: ${flag} ${value}.\n${help}`);
  }
  const items = names.length ? findOrnaments().filter(item => names.includes(item.name)) : ornaments;
  if (format !== 'all' && items.some(item => !item.formats.includes(format))) throw new Error(`Some selected designs do not support ${format}. Select compatible designs with --design or use --format all.`);
  const destination = path.resolve(args[1]);
  await mkdir(destination, { recursive: true });
  const resolved = await realpath(destination);
  // Never overwrite the installed package, its source, or an ancestor of either.
  const packageRoot = await realpath(root);
  if (resolved === packageRoot || packageRoot.startsWith(resolved + path.sep) || resolved.startsWith(packageRoot + path.sep)) throw new Error('Choose a destination outside the package directory.');
  const paths = new Set(['ornaments.css', 'LICENSE', 'ASSET-RIGHTS.md']);
  for (const item of items) for (const component of [item, ...Object.values(item.components)]) {
    for (const asset of [component, ...component.variants]) {
      for (const type of formats) if ((format === 'all' || format === type) && asset[type]) paths.add(asset[type]);
    }
  }
  for (const relative of paths) {
    const target = path.join(destination, relative);
    await mkdir(path.dirname(target), { recursive: true });
    // Resolve existing targets too: an accidental symlink must not redirect writes.
    const parent = await realpath(path.dirname(target));
    if (parent !== resolved && !parent.startsWith(resolved + path.sep)) throw new Error('Destination contains a symlink outside its root.');
    try {
      const existing = await realpath(target);
      if (!existing.startsWith(resolved + path.sep)) throw new Error('Destination file points outside its root.');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await copyFile(path.join(root, relative), target);
  }
  // Write a filtered catalog; omit unavailable formats when only one was copied.
  const catalog = JSON.parse(JSON.stringify(items));
  if (format !== 'all') for (const item of catalog) {
    item.formats = item.formats.filter(type => type === format);
    for (const component of [item, ...Object.values(item.components)]) for (const asset of [component, ...component.variants]) {
      for (const type of formats) if (type !== format) { delete asset[type]; delete asset[type + '_bytes']; }
    }
  }
  const { writeFile } = await import('node:fs/promises');
  const catalogPath = path.join(destination, 'catalog.json');
  try { const existing = await realpath(catalogPath); if (!existing.startsWith(resolved + path.sep)) throw new Error('catalog.json points outside destination.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
  console.log(`Copied ${items.length} designs and ${paths.size} files to ${destination}. Set assetsBase to its public URL.`);
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
