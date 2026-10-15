import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { getOrnament, findOrnaments, resolveOrnament } from '../lib/index.js';
import { resourceFile, registry } from '../scripts/resource-store.mjs';

const audit = JSON.parse(await readFile(new URL('../bestiary-additions.json', import.meta.url)));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('all sixteen accepted bestiary figures remain individual native-resolution illustrations', async () => {
  assert.equal(audit.assets.length, 16);
  assert.equal(new Set(audit.assets.map(item => item.name)).size, 16);
  assert.equal(audit.assets.filter(item => item.label.startsWith('DOG ')).length, 8);
  assert.equal(audit.assets.filter(item => item.label.startsWith('CAT ')).length, 8);
  assert.deepEqual(new Set(findOrnaments({ query: audit.set.name }).map(item => item.name)), new Set(audit.assets.map(item => item.name)));
  for (const entry of audit.assets) {
    const item = getOrnament(entry.name);
    assert.equal(registry().assignments[item.name], entry.resource);
    assert.equal(item.asset_type, 'illustration');
    assert.deepEqual(item.formats, ['webp', 'png']);
    assert.deepEqual(item.uses, ['image']);
    assert.equal(item.reference, 'bestiary-additions');
    assert.equal(item.derivation, 'independent-ai-interpretation');
    assert.equal(item.author, 'adrian729');
    assert.ok(item.has_transparency);
    assert.ok(!Object.hasOwn(item, 'provenance'));
    assert.match(item.usage_notes.join(' '), /Modern AI illustration/);
    assert.deepEqual([item.width, item.height], entry.native_dimensions);
    assert.ok(item.width <= entry.crop_bounds[2] - entry.crop_bounds[0]);
    assert.ok(item.height <= entry.crop_bounds[3] - entry.crop_bounds[1]);
    assert.ok(item.variants.every(v => v.width <= item.width && v.height <= item.height));
    assert.throws(() => resolveOrnament('frame', {design:item.name}), /cannot be used/);
    assert.throws(() => resolveOrnament('divider', {design:item.name}), /cannot be used/);
    const individual = await import(`../lib/designs/${item.name}.js`);
    assert.deepEqual(individual.ornament, item);
    assert.equal(hash(await readFile(resourceFile(entry.native_input))), entry.native_sha256);
    assert.equal(hash(await readFile(resourceFile(entry.master_path))), entry.master_sha256);
  }
});

test('accepted generation sheets and the separate original reference remain auditable', async () => {
  for (const source of Object.values(audit.sources)) {
    assert.equal(hash(await readFile(new URL('../'+source.path, import.meta.url))), source.sha256);
  }
  assert.ok(audit.assets.every(entry => entry.source === 'approved-sheet'));
  for (const generation of audit.prompts) assert.equal(hash(generation.prompt), generation.sha256);
});
