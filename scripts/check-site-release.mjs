// Leave the previous live site intact while a new resource/runtime release is
// still being published. A main-branch commit is not proof of CDN availability.
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const lock = JSON.parse(await readFile(new URL('resource-lock.json', root)));
if (Object.values(lock.sources).some(pin => !/^[a-f0-9]{40}$/.test(pin.gitCommit || ''))) {
  console.log('ready=false');
  console.error('Pages deferred: resource publication/locking is incomplete.');
} else {
  const { name, version } = JSON.parse(await readFile(new URL('package.json', root)));
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/${version}?release-check=${Date.now()}`, {
    signal: AbortSignal.timeout(30000), headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok && response.status !== 404) throw Error(`Cannot verify released runtime: npm HTTP ${response.status}.`);
  const ready = response.ok && (await response.json()).version === version;
  console.log(`ready=${ready}`);
  if (!ready) console.error(`Pages deferred: ${name}@${version} is not published yet.`);
}
