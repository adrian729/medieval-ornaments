import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, mkdtemp, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ornaments, getOrnament, findOrnaments, resolveOrnament, version, defaultAssetsBase } from '../lib/index.js';
import { main as copyAssets } from '../lib/cli.js';
const run = promisify(execFile), root = new URL('../', import.meta.url);
const environment = { ...process.env }; delete environment.NODE_TEST_CONTEXT;
const exec = (command, args) => run(command, args, { env: environment });

test('generated catalog agrees with artwork and has stable capabilities', async () => {
  const original = JSON.parse(await readFile(new URL('images.json', root)));
  assert.equal(ornaments.length, 49);
  assert.equal(findOrnaments({ use: 'frame' }).length, 40);
  assert.equal(findOrnaments({ use: 'divider' }).length, 40);
  assert.equal(findOrnaments({ use: 'image' }).length, 9);
  assert.deepEqual(ornaments.map(item => item.name), [...ornaments.map(item => item.name)].sort());
  for (const item of original) {
    const { uses, formats, ...generated } = getOrnament(item.name);
    assert.deepEqual(generated, item);
    assert.ok(Object.isFrozen(getOrnament(item.name).components));
    assert.ok(Object.isFrozen(getOrnament(item.name).variants));
    assert.deepEqual(uses, item.kind === 'standalone' ? ['image'] : ['frame', 'divider']);
    assert.deepEqual(formats, ['svg', 'webp', 'png'].filter(format => item[format]));
  }
});

test('version-pinned public URLs work without any browser globals', () => {
  assert.equal(defaultAssetsBase, `https://cdn.jsdelivr.net/npm/@ranx729/medieval-ornaments@${version}/`);
  const options = Object.freeze({ design: 'red-berry-vine' });
  const result = resolveOrnament('frame', options);
  assert.equal(result.asset.url, defaultAssetsBase + 'svg/red-berry-vine-border.svg');
  assert.equal(result.size, 32);
  assert.equal(result.asset.format, 'svg');
});

test('every repeat design selects original and forced axes with each format', async () => {
  for (const item of findOrnaments({ use: 'divider' })) {
    for (const orientation of ['original', 'horizontal', 'vertical']) for (const format of ['auto', 'svg', 'webp', 'png']) {
      const result = resolveOrnament('divider', { design: item.name, orientation, format });
      const axis = orientation === 'original' ? item.repeat_axis : orientation === 'horizontal' ? 'x' : 'y';
      const source = axis === item.repeat_axis ? item : item.components.rotated_tile;
      assert.equal(result.axis, axis);
      assert.equal(result.attributes['data-axis'], axis);
      assert.equal(result.style['--ornament-ratio'], String(item.repeat_ratio));
      assert.equal(result.style['--ornament-length'], axis === 'x' ? '100%' : '256px');
      assert.ok([source, ...source.variants].some(asset => asset[result.asset.format] === result.asset.path));
      await access(new URL(result.asset.path, root));
    }
    const frame = resolveOrnament('frame', { design: item.name, size: 33 });
    assert.equal(frame.style['--ornament-slice'], item.border_image_slice_percent + '%');
    assert.ok(frame.asset.path.includes('-border.'));
  }
});

test('whole designs use the painted default and fail unsupported repetition', () => {
  for (const item of findOrnaments({ use: 'image' })) {
    const result = resolveOrnament('image', { design: item.name });
    assert.equal(result.asset.format, 'webp');
    assert.equal(result.attributes.alt, '');
    assert.equal(result.style['--ornament-size'], '256px');
    assert.throws(() => resolveOrnament('divider', { design: item.name }), /cannot be used/);
    assert.throws(() => resolveOrnament('frame', { design: item.name }), /cannot be used/);
  }
  assert.throws(() => resolveOrnament('image', { design: 'red-berry-vine' }), /cannot be used/);
  assert.throws(() => resolveOrnament('image', { design: 'floral-bird-panel-blue', format: 'svg' }), /does not support/);
});

test('raster choice follows actual resolution at exact boundaries for all assets', () => {
  for (const item of ornaments) {
    const uses = item.kind === 'standalone' ? ['image'] : ['frame', 'divider'];
    for (const use of uses) for (const format of ['png', 'webp']) for (const density of [1, 2, 3]) {
      const source = use === 'frame' ? item.components.border_image : item;
      const factor = use === 'frame' ? 100 / item.border_image_slice_percent : use === 'divider' ? Math.max(1, item.repeat_ratio) : Math.max(1, source.width / source.height);
      const candidates = [...source.variants, source].sort((a, b) => Math.max(a.width, a.height) - Math.max(b.width, b.height));
      for (const candidate of candidates) for (const delta of [-0.01, 0, 0.01]) {
        const required = Math.max(candidate.width, candidate.height) + delta;
        const result = resolveOrnament(use, { design: item.name, size: required / factor / density, pixelRatio: density, format });
        const expected = candidates.find(asset => Math.max(asset.width, asset.height) + 1e-8 >= required) ?? source;
        assert.equal(result.asset.path, expected[format], `${item.name} ${use} ${density} ${required}`);
        assert.equal(result.asset.resolutionLimited, Math.max(expected.width, expected.height) + 1e-8 < required);
        assert.ok(result.asset.width <= source.width && result.asset.height <= source.height);
      }
    }
  }
});

test('selection filters combine capabilities, categories, subjects, colors, and query', () => {
  assert.ok(findOrnaments({ use: 'image', subjects: ['bird'] }).every(item => item.subjects.includes('bird')));
  assert.equal(findOrnaments({ query: 'RED BERRY', use: 'frame', categories: ['floral'], colors: ['red'] })[0].name, 'red-berry-vine');
  assert.deepEqual(findOrnaments({ query: 'never-existing-design' }), []);
  assert.throws(() => getOrnament('unknown'), /Unknown ornament/);
  assert.throws(() => findOrnaments({ use: 'unknown' }), /use must/);
  assert.throws(() => findOrnaments({ colors: 'red' }), /arrays/);
});

test('invalid options and accidental CSS paths fail clearly', () => {
  for (const key of ['size', 'pixelRatio']) for (const value of [0, -1, null, '24', Infinity, NaN]) assert.throws(() => resolveOrnament('divider', { design: 'red-berry-vine', [key]: value }), /positive number/);
  for (const length of [0, -4, '', 'calc(100% - 2px)', 'auto', '0px', 'foo']) assert.throws(() => resolveOrnament('divider', { design: 'red-berry-vine', length }), /length/);
  for (const orientation of ['x', 'y', null, 'sideways']) assert.throws(() => resolveOrnament('divider', { design: 'red-berry-vine', orientation }), /orientation/);
  for (const assetsBase of ['relative/', './assets', '//host/', 'file:///tmp/', 'https://host/path?x=1', 'https://user:password@host/']) assert.throws(() => resolveOrnament('frame', { design: 'red-berry-vine', assetsBase }), /assetsBase/);
  assert.throws(() => resolveOrnament('frame', { design: 'red-berry-vine', orientation: 'vertical' }), /Unsupported frame option/);
  assert.equal(resolveOrnament('frame', { design: 'red-berry-vine', assetsBase: '/nested/ornaments' }).asset.url, '/nested/ornaments/svg/red-berry-vine-border.svg');
  assert.equal(resolveOrnament('divider', { design: 'red-berry-vine', length: '20rem' }).style['--ornament-length'], '20rem');
});

test('copy CLI runs through a bin symlink and preserves selected files exactly', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'ornament-copy-test-'));
  const bin = path.join(folder, 'medieval-ornaments');
  await symlink(new URL('lib/cli.js', root), bin);
  const out = path.join(folder, 'assets');
  await exec(process.execPath, [bin, 'copy-assets', out, '--design', 'red-berry-vine', '--design', 'floral-bird-panel-blue']);
  const catalog = JSON.parse(await readFile(path.join(out, 'catalog.json')));
  assert.deepEqual(catalog.map(item => item.name), ['floral-bird-panel-blue', 'red-berry-vine']);
  for (const item of catalog) for (const component of [item, ...Object.values(item.components)]) for (const asset of [component, ...component.variants]) for (const format of ['svg', 'png', 'webp']) if (asset[format]) {
    assert.deepEqual(await readFile(path.join(out, asset[format])), await readFile(new URL(asset[format], root)));
  }
  await assert.rejects(copyAssets(['copy-assets', new URL('.', root).pathname]), /outside the package directory/);
  await assert.rejects(copyAssets(['copy-assets', out, '--design', 'floral-bird-panel-blue', '--format', 'svg']), /do not support/);
});
