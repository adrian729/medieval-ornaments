// Run by the resource publish workflow before anything is packed or uploaded.
// The dispatched tooling ref must be part of main's history, and the source's
// pin in that ref must equal its pin on main today, so an older or abandoned
// approval can never be published. The workflow must also be building exactly
// the locked resource commit.
// Usage (GitHub Actions): TOOLING_REF=<sha> RESOURCE_SHA=<sha> node scripts/check-publish-ref.mjs <source-id> [--ancestor-only]
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resourceLock, stable } from './resource-store.mjs';

export const mainRepository = 'adrian729/medieval-ornaments';

async function github(route, { fetch, token, raw = false }) {
  const response = await fetch(`https://api.github.com/repos/${mainRepository}/${route}`, {
    headers: { Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw Error(`GitHub HTTP ${response.status} for ${route}`);
  return raw ? response.text() : response.json();
}

// ancestorOnly (authentication checks, which never upload) skips the pin rules
// but still refuses tooling that is not part of main.
export async function checkPublishRef(id, { toolingRef, resourceSha, lock = resourceLock(), fetch = globalThis.fetch, token, ancestorOnly = false } = {}) {
  if (!/^[a-f0-9]{40}$/.test(toolingRef || '')) throw Error('tooling-ref must be a full main commit SHA.');
  const pin = lock.sources[id];
  if (!pin) throw Error(`Unknown resource: ${id}`);
  const comparison = await github(`compare/${toolingRef}...main`, { fetch, token });
  if (!['ahead', 'identical'].includes(comparison.status)) throw Error(`tooling-ref ${toolingRef} is not part of main's history (${comparison.status}).`);
  if (ancestorOnly) return { id, version: pin.version, gitCommit: pin.gitCommit, main: null };
  if (!/^[a-f0-9]{40}$/.test(pin.gitCommit || '')) throw Error(`${id} is not locked to an exact commit at ${toolingRef}.`);
  if (resourceSha !== pin.gitCommit) throw Error(`This run builds ${resourceSha}, but ${id} is locked to ${pin.gitCommit}. Dispatch the locked commit.`);
  const head = (await github('commits/main', { fetch, token })).sha;
  const current = JSON.parse(await github(`contents/resource-lock.json?ref=${head}`, { fetch, token, raw: true })).sources[id];
  if (stable(current) !== stable(pin)) throw Error(`${id}'s pin at ${toolingRef} differs from main ${head}; dispatch with main's current approval.`);
  return { id, version: pin.version, gitCommit: pin.gitCommit, main: head };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [id, flag] = process.argv.slice(2), ancestorOnly = flag === '--ancestor-only';
  if (!id || (flag && !ancestorOnly)) throw Error('Usage: TOOLING_REF=<sha> RESOURCE_SHA=<sha> node scripts/check-publish-ref.mjs <source-id> [--ancestor-only]');
  const result = await checkPublishRef(id, { toolingRef: process.env.TOOLING_REF, resourceSha: process.env.RESOURCE_SHA, token: process.env.GITHUB_TOKEN, ancestorOnly });
  console.log(ancestorOnly ? `Tooling ${process.env.TOOLING_REF} is part of main.` : `Publishing ${result.id}@${result.version} from locked commit ${result.gitCommit}; tooling matches main ${result.main}.`);
}
