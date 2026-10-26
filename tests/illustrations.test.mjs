import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ornaments, findOrnaments, getOrnament } from '../lib/index.js';

const root = new URL('../', import.meta.url);
const fields = ['description', 'categories', 'subjects', 'facing', 'colors', 'composition'];

test('illustration migration preserves every imported byte and all descriptive fields', async () => {
  const snapshot = JSON.parse(await readFile(new URL('sources/medieval-cutouts/images.json', root)));
  const master = JSON.parse(await readFile(new URL('illustrations.json', root)));
  for (const original of master) {
    const item = getOrnament(original.name);
    for (const key of fields) assert.deepEqual(item[key], original[key], `${item.name}: ${key}`);
    assert.equal(item.asset_type, 'illustration');
    assert.equal(item.kind, 'standalone');
    assert.deepEqual(item.uses, ['image']);
    assert.deepEqual(item.formats, ['svg', 'webp', 'png'].filter(format => original[format]));
    assert.deepEqual(item.components, {});
    assert.deepEqual(item.variants, original.variants);
    assert.ok(item.usage_notes.length);
  }
  const audit = JSON.parse(await readFile(new URL('illustration-import.json', root)));
  assert.deepEqual(audit.designs, snapshot.map(item => item.name));
  for (const [relative, expected] of Object.entries(audit.files)) {
    // The active master catalog is editable; the historical imported snapshot
    // remains independently hashed so later metadata additions need not rewrite it.
    if (relative === 'illustrations.json') continue;
    const bytes = await readFile(new URL(relative, root));
    assert.equal(bytes.length, expected.bytes, relative);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256, relative);
  }
});

test('scoped discovery contains only its family and combines layout/subject filters', async () => {
  for (const [scope, type] of [['borders', 'border'], ['decorations', 'decoration'], ['illustrations', 'illustration']]) {
    const api = await import(`../lib/selection-${scope}.js`);
    const expected = ornaments.filter(item => item.asset_type === type);
    assert.deepEqual(api.ornaments, expected);
    assert.deepEqual(api.findOrnaments(), expected);
    assert.throws(() => api.getOrnament(type === 'illustration' ? 'red-berry-vine' : 'flying-pig'), /Unknown ornament/);
  }
  const catalog = JSON.parse(await readFile(new URL('images.json', root)));
  for (const assetType of ['border', 'decoration', 'illustration']) assert.equal(findOrnaments({ assetType }).length, catalog.filter(item => item.asset_type === assetType).length);
  const rabbits = findOrnaments({ assetType: 'illustration', categories: ['animals', 'music'], subjects: ['rabbit'], facing: 'left', hasTransparency: true, composition: 'single-figure' });
  for (const name of ['bunny-trumpet', 'rabbit-bagpiper']) assert.ok(rabbits.some(item => item.name === name));
  assert.ok(findOrnaments({ assetType: 'illustration', categories: ['reading'], subjects: ['rabbit'] }).some(item => item.name === 'rabbit-reading-book'));
  assert.ok(findOrnaments({ hasTransparency: false, assetType: 'illustration' }).some(item => item.name === 'animal-musicians-ensemble'));
  assert.ok(findOrnaments({ assetType: 'illustration', query: 'OPAQUE CURVED BODY' }).some(item => item.name === 'creature-in-gold-shape'));
  assert.ok(findOrnaments({ use: 'frame', subjects: ['scroll'] }).some(item => item.name === 'plate-01-linked-scrolls'));
  for (const options of [{ assetType: 'picture' }, { hasTransparency: 'true' }, { facing: 'up' }, { composition: 'square' }]) assert.throws(() => findOrnaments(options));
});
