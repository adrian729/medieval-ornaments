import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, cp, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ornaments, getOrnament, findOrnaments, resolveOrnament } from '../lib/index.js';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
import { registry, resourceLock, resourceFile, designStems } from '../scripts/resource-store.mjs';
const root = new URL('../', import.meta.url);
const audit = JSON.parse(await readFile(new URL('finished-additions.json', root)));

test('the finished catalog excludes superseded versions and retains source identities and sets', () => {
  assert.equal(audit.imported_count, 541);
  assert.equal(ornaments.length, 161 + audit.imported_count);
  for (const entry of audit.assets) {
    const item = getOrnament(entry.name);
    assert.equal(item.reference, entry.id.split('--')[0]);
    assert.equal(item.provenance.audit, 'finished-additions.json');
    assert.equal(item.provenance.source_sha256, audit.sources[item.reference].original.source_sha256);
    for (const set of item.sets || []) assert.ok(findOrnaments({ query: set.name }).includes(item));
  }
  const imported = new Set(audit.assets.map(entry => entry.id));
  for (const decision of audit.duplicates) {
    assert.ok(imported.has(decision.keep));
    assert.ok(!imported.has(decision.exclude));
  }
});

test('divider-only patterns reject frames and expose only their supported individual API', async () => {
  const names = ['gold-s-shaped-leaf-on-red-repeat', 'white-curling-vine-on-blue-repeat'];
  for (const name of names) {
    const item = getOrnament(name);
    assert.deepEqual(item.uses, ['divider']);
    assert.equal(item.components.border_image, undefined);
    assert.ok(!findOrnaments({ use: 'frame' }).includes(item));
    for (const orientation of ['original', 'horizontal', 'vertical']) assert.ok(resolveOrnament('divider', { design: name, orientation }).asset.path);
    assert.throws(() => resolveOrnament('frame', { design: name }), /cannot be used/);
    const api = await import(`../lib/designs/${name}.js`);
    assert.equal(typeof api.createDivider, 'function');
    assert.equal(api.createFrame, undefined);
    assert.throws(() => api.resolveOrnament('frame'), /cannot be used/);
  }
});

test('all four corner downloads follow their design through offline selected installation', async t => {
  const name = 'alternating-blue-cup-and-burst-flowers-on-green-stem';
  const item = getOrnament(name), config = registry(), id = config.assignments[name], pin = resourceLock().sources[id];
  const temporary = await mkdtemp(path.join(tmpdir(), 'finished-resource-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const installed = path.join(temporary, 'node_modules', config.sources[id].package);
  await mkdir(installed, { recursive: true });
  await writeFile(path.join(installed, 'package.json'), JSON.stringify({name:config.sources[id].package,version:pin.version,exports:{'./package.json':'./package.json'}}));
  await cp(new URL(`resources/manifests/${id}.json`, root), path.join(installed, 'resource-manifest.json'));
  for (const asset of [item, ...Object.values(item.components)].flatMap(a => [a,...a.variants])) {
    assert.ok(designStems(name).includes(path.basename(asset.png, '.png')));
    const destination = path.join(installed, asset.png);await mkdir(path.dirname(destination), {recursive:true});await cp(resourceFile(asset.png), destination);
  }
  const output=path.join(temporary,'components'),assets=path.join(temporary,'public');
  await exec(process.execPath,[new URL('../lib/cli.js',import.meta.url).pathname,'add',name,'--framework','vanilla','--format','png','--out',output,'--assets',assets,'--assets-base','/art/','--offline'],{cwd:temporary});
  const api=await import(pathToFileURL(path.join(output,name+'.js')));
  assert.deepEqual(api.ornament.sets,item.sets);
  for(const role of ['top-left','top-right','bottom-left','bottom-right']){
    const asset=api.ornament.components['corner-'+role];
    assert.deepEqual(await readFile(path.join(assets,asset.png)),await readFile(resourceFile(item.components['corner-'+role].png)));
  }
  assert.ok(!(await readdir(path.join(assets,'png'))).includes('red-berry-vine.png'));
});
