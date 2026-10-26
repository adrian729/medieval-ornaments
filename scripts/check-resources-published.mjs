// Release/Pages gate: every pinned resource version must be published, tagged
// at its locked commit and served by the CDN. Locks may precede publication.
// Usage: node scripts/check-resources-published.mjs [source-id ...] [--json]
// Exits 1 and lists the pending sources when any pin is not yet published.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { publicationStatus } from './publication.mjs';
import { registry } from './resource-store.mjs';

export async function pendingSources(ids, options) {
  return (await publicationStatus(ids, options)).filter(status => !status.published);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2), json = args.includes('--json');
  const ids = args.filter(arg => arg !== '--json');
  for (const id of ids) if (!registry().sources[id]) throw Error(`Unknown resource: ${id}`);
  const statuses = await publicationStatus(ids.length ? ids : undefined), pending = statuses.filter(status => !status.published);
  if (json) console.log(JSON.stringify(statuses, null, 2));
  else for (const status of pending) console.error(`pending ${status.id}@${status.version}: ${status.reason}`);
  if (pending.length) process.exitCode = 1;
  else if (!json) console.log(`All ${statuses.length} pinned resource versions are published, tagged and served by the CDN.`);
}
