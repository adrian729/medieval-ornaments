// Warm and verify the default CDN right after publishing. jsDelivr fetches a
// new package version on its first request, which can take seconds and briefly
// answer 404. This waits until npm lists the version, then requests every file
// until it is served with the approved bytes, so no visitor or pin ever sees a
// version the CDN cannot serve yet.
// Usage: node scripts/warm-cdn.mjs <package-directory | source-id | --all> [--deadline-minutes 15]
// A source id (or --all) warms the versions pinned in resource-lock.json from main's manifests.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { cdnBase, registry, resourceLock, manifest } from './resource-store.mjs';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// Resource packages list every public file in their approved manifest. The
// runtime is checked through the files copied snippets and CDN imports use.
async function expectedFiles(directory) {
  try {
    const manifest = JSON.parse(await readFile(path.join(directory, 'resource-manifest.json')));
    return Object.entries(manifest.files).map(([relative, file]) => ({ relative, ...file }));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return Promise.all(['package.json', 'ornaments.css', 'lib/index.js', 'lib/react-styled.js'].map(async relative => {
      const bytes = await readFile(path.join(directory, relative));
      return { relative, bytes: bytes.length, sha256: sha256(bytes) };
    }));
  }
}

export async function warmCdn(directory, { deadlineMinutes = 15, concurrency = 8, log = console.log, pinned } = {}) {
  const { name, version } = pinned || JSON.parse(await readFile(path.join(directory, 'package.json')));
  const deadline = Date.now() + deadlineMinutes * 60_000, base = cdnBase(name, version);
  while ((await fetch(`https://registry.npmjs.org/${name}/${version}`)).status !== 200) {
    if (Date.now() > deadline) throw Error(`npm does not list ${name}@${version} yet.`);
    await pause(10_000);
  }
  const files = pinned ? pinned.files : await expectedFiles(directory), failures = new Map();
  let next = 0, served = 0;
  async function worker() {
    while (next < files.length) {
      const file = files[next++];
      for (let attempt = 0; ; attempt++) {
        try {
          const response = await fetch(base + file.relative);
          if (response.ok) {
            const bytes = Buffer.from(await response.arrayBuffer());
            if (bytes.length === file.bytes && sha256(bytes) === file.sha256) { served++; failures.delete(file.relative); break; }
            failures.set(file.relative, `unexpected bytes (${bytes.length})`);
          } else failures.set(file.relative, `HTTP ${response.status}`);
        } catch (error) { failures.set(file.relative, error.message); }
        if (Date.now() > deadline) return;
        await pause(Math.min(30_000, 2_000 * 2 ** Math.min(attempt, 4)));
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  if (served !== files.length) {
    const sample = [...failures].slice(0, 5).map(([relative, reason]) => `${relative}: ${reason}`).join('; ');
    throw Error(`${base} served ${served}/${files.length} files with approved bytes before the deadline. ${sample}`);
  }
  log(`${base} serves all ${files.length} files with approved bytes.`);
  return { base, files: files.length };
}

// A published, locked source as listed in main: package, exact version and approved files.
export function pinnedSource(id) {
  const source = registry().sources[id], data = manifest(id);
  if (!source) throw Error(`Unknown resource: ${id}`);
  return { name: source.package, version: resourceLock().sources[id].version, files: Object.entries(data.files).map(([relative, file]) => ({ relative, ...file })) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [target, flag, minutes] = process.argv.slice(2);
  if (!target) throw Error('Usage: node scripts/warm-cdn.mjs <package-directory | source-id | --all> [--deadline-minutes 15]');
  const deadlineMinutes = flag === '--deadline-minutes' ? Number(minutes) : 15;
  const ids = target === '--all' ? Object.keys(registry().sources) : Object.hasOwn(registry().sources, target) ? [target] : null;
  if (ids) for (const id of ids) await warmCdn(null, { deadlineMinutes, pinned: pinnedSource(id) });
  else await warmCdn(path.resolve(target), { deadlineMinutes });
}
