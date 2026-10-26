// Pages always deploys the last published runtime release, never main's tip:
// pending (approved but unpublished) changes on main must not reach the live
// site before the maintainer's "publish". release.yml creates the v<version>
// tag only after the runtime and every pinned resource are published, so the
// tag of package.json's version is the deployable state. While a version bump
// waits for its release, the previous live site stays in place.
import { readFile } from 'node:fs/promises';
import { tagCommit } from './publication.mjs';
import { mainRepository } from './check-publish-ref.mjs';
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
const commit = await tagCommit(mainRepository, `v${version}`);
console.log(`ready=${Boolean(commit)}`);
if (commit) console.log(`ref=${commit}`);
else console.error(`Pages deferred: v${version} has not been released yet.`);
