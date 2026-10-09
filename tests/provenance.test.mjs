import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ornaments, getOrnament, findOrnaments, resolveOrnament } from '../lib/index.js';
import { resourceFile } from '../scripts/resource-store.mjs';

const json = async relative => JSON.parse(await readFile(new URL('../'+relative, import.meta.url)));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('historical origins reach full, scoped and individual metadata without backfilling legacy assets', async () => {
  const audit = await json('historical-additions.json');
  const borders = await json('historical-border-patterns.json');
  const supplied = await json('illustration-additions.json');
  const authored = await json('authored-additions.json');
  const names = new Set([...audit.assets, ...borders, ...supplied.assets, ...authored.assets].map(item => item.name));
  const masters = [...await json('illustrations.json'), ...await json('raster-metadata.json')];
  for (const entry of audit.assets) {
    const item = getOrnament(entry.name);
    const master = masters.find(item => item.name === entry.name);
    const individual = await import('../lib/design-data/'+entry.name+'.js');
    assert.deepEqual(item.provenance, master.provenance);
    assert.deepEqual(individual.ornament.provenance, item.provenance);
    assert.ok(Object.isFrozen(item.provenance));
    assert.equal(item.provenance.audit, 'historical-additions.json');
    assert.deepEqual(item.uses, ['image']);
    assert.equal(item.repeat_axis, 'none');
    assert.deepEqual(item.components, {});
    assert.throws(() => resolveOrnament('frame', { design: entry.name }), /support|capab|frame/);
  }
  const scoped = await import('../lib/catalog-illustrations.js');
  assert.ok(scoped.ornaments.some(item => item.name === 'hoefnagel-cut-apple' && item.provenance));
  const legacy = ornaments.filter(item => !names.has(item.name));
  assert.equal(legacy.length, 111);
  assert.ok(legacy.every(item => !Object.hasOwn(item, 'provenance')));
  assert.equal(findOrnaments({ query: 'Hoefnagel' }).length, 4);
  assert.equal(findOrnaments({ query: 'Walters Art Museum' }).length, 4);
});

test('author reaches full, scoped and individual imports and search without attributing unknown artwork', async () => {
  const audit = await json('authored-additions.json');
  const authoredNames = new Set(['polyhymnia', ...audit.assets.map(item => item.name)]);
  const masters = [...await json('illustrations.json'), ...await json('raster-metadata.json')];
  const scopes = await Promise.all(['decorations', 'illustrations'].map(scope => import('../lib/selection-'+scope+'.js')));
  for (const name of authoredNames) {
    const item = getOrnament(name);
    const individual = await import('../lib/designs/'+name+'.js');
    const react = await import('../lib/react-designs/'+name+'.js');
    assert.equal(item.author, 'adrian729');
    assert.equal(masters.find(master => master.name === name).author, item.author);
    assert.deepEqual(individual.ornament, item);
    assert.deepEqual(react.ornament, item);
    assert.equal(scopes.flatMap(scope => scope.ornaments).find(entry => entry.name === name).author, item.author);
    assert.ok(Object.isFrozen(item));
    assert.throws(() => { item.author = 'someone-else'; }, TypeError);
  }
  assert.deepEqual(new Set(findOrnaments({ query: 'adrian729' }).map(item => item.name)), authoredNames);
  assert.ok(ornaments.filter(item => !authoredNames.has(item.name)).every(item => !Object.hasOwn(item, 'author')));
  for (const entry of audit.assets) {
    const item = getOrnament(entry.name);
    assert.equal(hash(await readFile(resourceFile(entry.native_input))), entry.source_sha256);
    assert.equal(hash(await readFile(resourceFile(item.png))), entry.master_sha256);
    assert.deepEqual([item.width, item.height], entry.native_dimensions);
    assert.deepEqual(item.formats, ['webp', 'png']);
    assert.deepEqual(item.uses, ['image']);
    assert.ok(!Object.hasOwn(item, 'provenance'));
    assert.equal(item.reference, 'authored-additions');
  }
});

test('source and generated native bytes remain auditable; restricted scans are not imported', async () => {
  const audit = await json('historical-additions.json');
  const supplied = await json('illustration-additions.json');
  for (const entry of supplied.assets) {
    const item = getOrnament(entry.name);
    assert.equal(hash(await readFile(resourceFile(entry.generated_input))), entry.generated_sha256);
    assert.equal(hash(await readFile(resourceFile(item.png))), entry.master_sha256);
    assert.deepEqual([item.width, item.height], entry.native_dimensions);
    assert.equal(item.derivation, entry.method);
    assert.equal(item.reference, 'illustration-additions');
    assert.match(item.usage_notes.join(' '), /modern AI illustration/);
  }
  for (const source of Object.values(audit.sources)) {
    assert.equal(hash(await readFile(new URL('../'+source.path, import.meta.url))), source.sha256);
  }
  for (const entry of audit.assets) {
    const item = getOrnament(entry.name);
    assert.equal(hash(await readFile(resourceFile(entry.generated_input))), entry.generated_sha256);
    assert.equal(hash(await readFile(resourceFile(item.png))), entry.master_sha256);
    assert.ok(Math.max(item.width, item.height) <= entry.max_dimension);
    if (entry.source) {
      assert.equal(item.provenance.source_sha256, audit.sources[entry.source].sha256);
      assert.equal(item.provenance.method, 'ai-assisted-extraction');
    } else {
      assert.equal(item.provenance.method, 'independent-ai-interpretation');
      assert.ok(!Object.hasOwn(item.provenance, 'image_url'));
      assert.ok(!Object.hasOwn(item.provenance, 'source_sha256'));
      assert.match(item.usage_notes.join(' '), /modern interpretation/);
    }
  }
});
