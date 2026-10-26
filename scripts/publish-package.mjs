// Idempotent npm publication of a prepared tarball. A version that already
// exists is never uploaded again: its registry integrity must equal the local
// tarball's, so reruns after a CDN timeout continue safely and a different
// upload under the same version fails loudly.
// Usage: node scripts/publish-package.mjs <package.tgz> <name> <version> [--tag <dist-tag>]
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { npmVersion } from './publication.mjs';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export const integrity = bytes => 'sha512-' + createHash('sha512').update(bytes).digest('base64');

function npmPublish(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', args, { stdio: ['ignore', 'inherit', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', chunk => { process.stderr.write(chunk); stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stderr }));
  });
}

export async function publishPackage(tarball, name, version, { tag, provenance = true, fetch = globalThis.fetch, publish = npmPublish, waitMinutes = 10, pollMs = 15_000, log = console.log } = {}) {
  const expected = integrity(await readFile(tarball));
  const compare = existing => {
    if (existing.integrity !== expected) throw Error(`${name}@${version} already exists with integrity ${existing.integrity}, not the local ${expected}. Approve a new version.`);
  };
  const existing = await npmVersion(name, version, { fetch });
  if (existing) { compare(existing); log(`${name}@${version} is already published with identical bytes; skipping upload.`); return { status: 'existing', integrity: expected }; }
  const args = ['publish', tarball, '--access', 'public', '--registry', 'https://registry.npmjs.org', ...(provenance ? ['--provenance'] : []), ...(tag ? ['--tag', tag] : [])];
  const { code, stderr } = await publish(args);
  // A conflict means an earlier attempt (or a racing run) uploaded first. npm
  // can take minutes to list a new version, so wait for it before comparing.
  if (code !== 0 && !/previously published|cannot publish over|EPUBLISHCONFLICT/i.test(stderr)) throw Error(`npm publish failed for ${name}@${version} (exit ${code}).`);
  if (code === 0) log(`Uploaded ${name}@${version}.`);
  for (const deadline = Date.now() + waitMinutes * 60_000; ;) {
    const listed = await npmVersion(name, version, { fetch });
    if (listed) { compare(listed); return { status: code === 0 ? 'published' : 'existing', integrity: expected }; }
    if (Date.now() > deadline) throw Error(`npm does not list ${name}@${version} ${waitMinutes} minutes after publication.`);
    await pause(pollMs);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [tarball, name, version, flag, tag] = process.argv.slice(2);
  if (!tarball || !name || !version || (flag && flag !== '--tag')) throw Error('Usage: node scripts/publish-package.mjs <package.tgz> <name> <version> [--tag <dist-tag>]');
  await publishPackage(path.resolve(tarball), name, version, { tag });
}
