// Publication state of locked resources, derived from npm, GitHub and the CDN.
// resource-lock.json records approved exact commits before publication; a pin
// counts as published only when all three of these hold:
//   1. npm lists package@version;
//   2. the storage repository's tag v<version> points at the locked commit (the
//      publish workflow creates that tag and its release only after warm-cdn
//      verified every approved file);
//   3. the CDN serves resource-manifest.json with the approved manifest digest.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { registry, resourceLock, cdnBase } from './resource-store.mjs';

const run = promisify(execFile);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// Registry metadata for one exact version: null when npm does not list it.
export async function npmVersion(name, version, { fetch = globalThis.fetch } = {}) {
  const response = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}/${version}?t=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw Error(`npm HTTP ${response.status} for ${name}@${version}`);
  const data = await response.json();
  return data.version === version ? { version, integrity: data.dist?.integrity } : null;
}

// Commit a remote tag points at (peeling annotated tags); null when absent.
// git ls-remote needs no API token and has no REST rate limit.
export async function tagCommit(repository, tag, { exec = run } = {}) {
  const { stdout } = await exec('git', ['ls-remote', `https://github.com/${repository}.git`, `refs/tags/${tag}`, `refs/tags/${tag}^{}`]);
  const refs = Object.fromEntries(stdout.trim().split('\n').filter(Boolean).map(line => line.split('\t').reverse()));
  return refs[`refs/tags/${tag}^{}`] || refs[`refs/tags/${tag}`] || null;
}

export async function sourceStatus(id, { fetch = globalThis.fetch, exec = run, config = registry(), lock = resourceLock() } = {}) {
  const source = config.sources[id], pin = lock.sources[id];
  if (!source || !pin) throw Error(`Unknown resource: ${id}`);
  const status = { id, package: source.package, version: pin.version, gitCommit: pin.gitCommit, npm: false, tag: false, cdn: false };
  if (!/^[a-f0-9]{40}$/.test(pin.gitCommit || '')) return { ...status, published: false, reason: 'not locked to an exact commit' };
  status.npm = Boolean(await npmVersion(source.package, pin.version, { fetch }));
  if (!status.npm) return { ...status, published: false, reason: 'npm does not list this version' };
  const commit = await tagCommit(source.repository, `v${pin.version}`, { exec });
  status.tag = commit === pin.gitCommit;
  if (!status.tag) return { ...status, published: false, reason: commit ? `tag v${pin.version} points at ${commit}, not the locked commit` : `no v${pin.version} release marker yet` };
  const response = await fetch(cdnBase(source.package, pin.version) + 'resource-manifest.json', { signal: AbortSignal.timeout(60_000) });
  status.cdn = response.ok && sha256(Buffer.from(await response.arrayBuffer())) === pin.manifestSha256;
  if (!status.cdn) return { ...status, published: false, reason: `CDN manifest ${response.ok ? 'differs from the approved digest' : `HTTP ${response.status}`}` };
  return { ...status, published: true };
}

export async function publicationStatus(ids = Object.keys(registry().sources), options = {}) {
  const results = [];
  for (let i = 0; i < ids.length; i += 6) results.push(...await Promise.all(ids.slice(i, i + 6).map(id => sourceStatus(id, options))));
  return results;
}

// Exact on-disk Git object storage of a complete (non-shallow, non-partial)
// clone, the history-capacity measure compared with policy.maxGitBytes.
export async function gitObjectBytes(directory, { exec = run } = {}) {
  const git = async (...args) => (await exec('git', args, { cwd: directory })).stdout.trim();
  if (await git('rev-parse', '--is-shallow-repository') === 'true') throw Error('History capacity needs a complete clone, not a shallow one.');
  let partial = '';
  try { partial = await git('config', '--get', 'remote.origin.promisor'); } catch {}
  if (partial === 'true') throw Error('History capacity needs a complete clone, not a partial one.');
  const objects = Object.fromEntries((await git('count-objects', '-v')).split('\n').map(line => line.split(': ')));
  return (Number(objects.size) + Number(objects['size-pack'])) * 1024;
}
