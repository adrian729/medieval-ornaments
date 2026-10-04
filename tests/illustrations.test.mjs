import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ornaments, findOrnaments, resolveOrnament, getOrnament } from '../lib/index.js';
import { main } from '../lib/cli.js';

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
    assert.deepEqual(item.formats, ['webp', 'png']);
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
  assert.equal(findOrnaments({ assetType: 'border' }).length, 56);
  assert.equal(findOrnaments({ assetType: 'decoration' }).length, 14);
  assert.equal(findOrnaments({ assetType: 'illustration' }).length, 41);
  const rabbits = findOrnaments({ assetType: 'illustration', categories: ['animals', 'music'], subjects: ['rabbit'], facing: 'left', hasTransparency: true, composition: 'single-figure' });
  assert.deepEqual(rabbits.map(item => item.name), ['bunny-trumpet', 'rabbit-bagpiper']);
  assert.deepEqual(findOrnaments({ assetType: 'illustration', categories: ['reading'], subjects: ['rabbit'] }).map(item => item.name), ['rabbit-reading-book']);
  assert.ok(findOrnaments({ hasTransparency: false, assetType: 'illustration' }).some(item => item.name === 'animal-musicians-ensemble'));
  assert.ok(findOrnaments({ assetType: 'illustration', query: 'OPAQUE CURVED BODY' }).some(item => item.name === 'creature-in-gold-shape'));
  assert.ok(findOrnaments({ use: 'frame', subjects: ['scroll'] }).some(item => item.name === 'plate-01-linked-scrolls'));
  for (const options of [{ assetType: 'picture' }, { hasTransparency: 'true' }, { facing: 'up' }, { composition: 'square' }]) assert.throws(() => findOrnaments(options));
});

test('illustrations inherit sufficient variants, native image hints and capability restrictions', () => {
  const result = resolveOrnament('image', { design: 'flying-pig', size: 128, loading: 'lazy', decoding: 'async', fetchPriority: 'low' });
  assert.equal(result.asset.path, 'webp/256/flying-pig.webp');
  assert.equal(result.asset.resolutionLimited, false);
  assert.equal(result.attributes.width, String(getOrnament('flying-pig').width));
  assert.equal(result.attributes.height, String(getOrnament('flying-pig').height));
  assert.equal(result.attributes.loading, 'lazy');
  assert.equal(result.attributes.decoding, 'async');
  assert.equal(result.attributes.fetchpriority, 'low');
  assert.equal(resolveOrnament('image', { design: 'creature-in-gold-shape', size: 1000 }).asset.resolutionLimited, true);
  for (const use of ['frame', 'divider']) assert.throws(() => resolveOrnament(use, { design: 'flying-pig' }), /cannot be used/);
  assert.throws(() => resolveOrnament('image', { design: 'flying-pig', format: 'svg' }), /does not support/);
});

test('local illustration installation copies only selected files and preserves metadata', async t => {
  const folder = await mkdtemp(path.join(tmpdir(), 'ornaments-illustration-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const out = path.join(folder, 'src'), assets = path.join(folder, 'public');
  const options = ['--out', out, '--assets', assets, '--framework', 'vanilla', '--from', root.pathname, '--offline'];
  await main(['add', 'flying-pig', ...options]);
  const api = await import(pathToFileURL(path.join(out, 'flying-pig.js')));
  assert.equal(api.ornament.asset_type, 'illustration');
  assert.deepEqual(api.ornament.formats, ['webp']);
  assert.equal(api.ornament.description, getOrnament('flying-pig').description);
  assert.equal(api.resolveOrnament('image', { size: 128 }).asset.path, 'webp/256/flying-pig.webp');
  assert.equal(api.createDivider, undefined);
  assert.deepEqual(await readdir(path.join(out, 'lib/design-data')), ['flying-pig.js']);
  const images = (await readdir(assets, { recursive: true })).filter(file => /\.(png|webp|svg)$/.test(file));
  assert.deepEqual(images.sort(), ['webp/flying-pig.webp', ...['128','256','512','768'].map(size => `webp/${size}/flying-pig.webp`)].sort());
  await assert.rejects(main(['add', 'flying-pig', ...options, '--format', 'svg']), /does not support/);
});
