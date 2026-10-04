// One-time byte-verified migration. No image conversion or generation.
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { assetCatalog, assetPaths, catalogBytes } from './package-assets.mjs';
import { projectRoot, digest, sourceId, repositoryName, packageName, resourceDirectory, capabilities } from './resource-store.mjs';
if (!process.argv.includes('--initial-migration')) throw Error('Use --initial-migration only for the audited initial resource split.');
try { await access(path.join(projectRoot, 'resource-registry.json')); throw Error('Registry already exists; initial migration cannot reset assignments.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const items = await assetCatalog(), old = JSON.parse(await readFile(path.join(projectRoot, 'assets-manifest.json')));
const types = { border: 'borders', decoration: 'decorations', illustration: 'illustrations' };
const assignments = Object.fromEntries(items.map(item => [item.name, sourceId(types[item.asset_type], 1)]));
const config = { schemaVersion: 1, policy: { warnTrackedBytes: 600_000_000, newDesignTrackedBytes: 700_000_000, maxTrackedBytes: 850_000_000, warnGitBytes: 800_000_000, maxGitBytes: 950_000_000, maxFileBytes: 90 * 1024 * 1024 }, collections: {}, sources: {}, assignments };
const lock = { schemaVersion: 1, migratedFrom: { repository: 'adrian729/medieval-ornaments', commit: execFileSync('git', ['rev-parse', 'HEAD'], {cwd: projectRoot, encoding:'utf8'}).trim(), manifestSha256: digest(await readFile(path.join(projectRoot, 'assets-manifest.json'))) }, sources: {} };
const inventory = execFileSync('git', ['ls-tree', '-r', '-z', 'HEAD'], {cwd: projectRoot, encoding:'utf8'}).split('\0').filter(Boolean).map(row => row.split('\t')[1]);
async function hashFile(relative) {
  const hash = createHash('sha256'); let bytes = 0;
  for await (const chunk of createReadStream(path.join(projectRoot, relative))) { bytes += chunk.length; hash.update(chunk); }
  return { bytes, sha256: hash.digest('hex') };
}
await mkdir(path.join(projectRoot, 'resources/manifests'), {recursive:true});
for (const [type, collection] of Object.entries(types)) {
  const id = sourceId(collection, 1), names = new Set(items.filter(item => item.asset_type === type).map(item => item.name));
  config.collections[collection] = {assetTypes:[type], activeSource:id};
  config.sources[id] = {id, collection, sequence:1, state:'open', repository:`adrian729/${repositoryName(id)}`, package:packageName(id)};
  const files = {}, inputs = {};
  for (const relative of assetPaths(items.filter(item => names.has(item.name)))) {
    const actual = await hashFile(relative), expected = old.files[relative];
    if (!expected || actual.bytes !== expected.bytes || actual.sha256 !== expected.sha256) throw Error(`Unapproved bytes: ${relative}`);
    files[relative] = actual;
  }
  for (const relative of inventory) {
    const native = /^sources\/(?:tiles|traces)\//.test(relative) && names.has(path.basename(relative).replace(/\.[^.]+$/, ''));
    const illustrationSource = type === 'illustration' && relative.startsWith('sources/medieval-cutouts/sources/');
    if (native || illustrationSource) inputs[relative] = await hashFile(relative);
  }
  const approved = {schemaVersion:2, id, collection, package:packageName(id), version:'0.1.0', designs:Object.fromEntries(items.filter(item=>names.has(item.name)).map(item=>[item.name,capabilities(item)])), files, inputs};
  const content = JSON.stringify(approved, null, 2) + '\n';
  await writeFile(path.join(projectRoot, `resources/manifests/${id}.json`), content);
  lock.sources[id] = {version:'0.1.0', gitCommit:null, manifestSha256:digest(content), filesSha256:digest(files)};
  const directory = resourceDirectory(id); await mkdir(directory, {recursive:true});
  for (const relative of [...Object.keys(files), ...Object.keys(inputs)]) {
    const target = path.join(directory, relative); await mkdir(path.dirname(target), {recursive:true});
    await copyFile(path.join(projectRoot, relative), target);
  }
  const pkg = {name:packageName(id), version:'0.1.0', description:`Approved medieval ornament ${collection} resource ${id}`, type:'module', license:'SEE LICENSE IN ASSET-RIGHTS.md', repository:{type:'git',url:`git+https://github.com/adrian729/${repositoryName(id)}.git`}, homepage:'https://adrian729.github.io/medieval-ornaments/', exports:{'./catalog.json':'./catalog.json','./resource-manifest.json':'./resource-manifest.json','./svg/*':'./svg/*','./png/*':'./png/*','./webp/*':'./webp/*','./package.json':'./package.json'}, files:[...Object.keys(files),'resource-manifest.json','catalog.json','ASSET-RIGHTS.md','LICENSE'], sideEffects:false, publishConfig:{access:'public'}};
  await writeFile(path.join(directory, 'package.json'), JSON.stringify(pkg, null, 2)+'\n');
  await writeFile(path.join(directory, 'resource-manifest.json'), content);
  await writeFile(path.join(directory, 'catalog.json'), catalogBytes(items.filter(item=>names.has(item.name))));
  for (const notice of ['LICENSE','ASSET-RIGHTS.md']) await copyFile(path.join(projectRoot, notice), path.join(directory, notice));
  await writeFile(path.join(directory, '.gitignore'), 'node_modules/\ndist/\ntmp/\n*.tgz\n__pycache__/\n.venv*/\n');
  await writeFile(path.join(directory, 'README.md'), `# ${id}\n\nLarge approved resources for [medieval-ornaments](https://github.com/adrian729/medieval-ornaments).\n\nThe main repository owns placement, selection metadata, version locks and authoring tools. Read its [resource guide](https://github.com/adrian729/medieval-ornaments/blob/main/docs/RESOURCES.md) before adding or revising artwork.\n\nAll components, variants and editable inputs of a design stay together. npm includes approved public exports; editable source inputs remain in Git. Rendering performs no manifest request. Preserve the separate artwork rights in ASSET-RIGHTS.md; no collection-wide MIT grant is made.\n\nInitial bytes were verified against the main repository at ${lock.migratedFrom.commit}. Ordinary packaging copies those bytes and does not regenerate artwork.\n`);
  console.log(`${id}: ${Object.keys(files).length} exports, ${Object.keys(inputs).length} editable/source inputs; every export matches the approved inventory.`);
}
await writeFile(path.join(projectRoot, 'resource-registry.json'), JSON.stringify(config,null,2)+'\n');
await writeFile(path.join(projectRoot, 'resource-lock.json'), JSON.stringify(lock,null,2)+'\n');
