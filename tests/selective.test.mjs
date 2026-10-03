import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { ornaments, resolveOrnament } from '../lib/index.js';
import * as full from '../lib/react.js';
import { main } from '../lib/cli.js';
const root = new URL('../', import.meta.url);

test('all individual exports match full API geometry and SSR without the full catalog', async () => {
  for (const item of ornaments) {
    const api = await import(`../lib/designs/${item.name}.js`);
    const react = await import(`../lib/react-designs/${item.name}.js`);
    assert.equal(api.ornament, item);
    assert.ok(Object.isFrozen(item.components));
    for (const use of item.uses) {
      const component = `Ornament${use[0].toUpperCase() + use.slice(1)}`;
      for (const format of ['auto', ...item.formats]) for (const pixelRatio of [1, 1.25, 2]) {
        const options = { size: 33, format, pixelRatio, assetsBase: '/chosen/' };
        if (use === 'divider') options.orientation = 'horizontal';
        assert.deepEqual(api.resolveOrnament(use, options), resolveOrnament(use, { ...options, design: item.name }));
        assert.equal(renderToString(h(react[component], options)), renderToString(h(full[component], { ...options, design: item.name })));
      }
    }
    assert.throws(() => api.resolveOrnament(item.uses[0], { design: 'not-this-design' }), /supports only/);
    const missing = item.kind === 'standalone' ? 'createFrame' : 'createOrnamentImage';
    assert.equal(api[missing], undefined);
    assert.equal(react[item.kind === 'standalone' ? 'OrnamentDivider' : 'OrnamentImage'], undefined);
    assert.throws(() => api.resolveOrnament(item.kind === 'standalone' ? 'frame' : 'image'), /cannot be used/);
  }
});

async function installation(t) {
  const folder = await mkdtemp(path.join(tmpdir(), 'ornaments-add-'));
  const out = path.join(folder, 'src/ornaments'), assets = path.join(folder, 'public/ornaments');
  t.after(() => rm(folder, { recursive: true, force: true }));
  const args = ['--out', out, '--assets', assets, '--from', root.pathname, '--offline', '--framework', 'vanilla'];
  return { folder, out, assets, args };
}

test('local add copies selected code/artwork, resolves installed formats and merges new designs', async t => {
  const { out, assets, args } = await installation(t);
  await main(['add', 'red-berry-vine', ...args]);
  const api = await import(pathToFileURL(path.join(out, 'red-berry-vine.js')));
  assert.equal(api.resolveOrnament('divider').asset.format, 'svg');
  assert.ok(api.resolveOrnament('frame').asset.url.startsWith('/ornaments/'));
  assert.deepEqual(api.ornament.formats, ['svg']);
  assert.ok(api.resolveOrnament('frame', { assetsBase: undefined }).asset.url.startsWith('/ornaments/'));
  await writeFile(path.join(out, 'unrelated.txt'), 'Retain me');
  assert.throws(() => api.resolveOrnament('divider', { format: 'webp' }), /does not support/);
  await writeFile(path.join(out, 'red-berry-vine.js'), '// customized existing design\n');
  await main(['add', 'painted-sprawling-floral-panel', ...args]);
  assert.equal(await readFile(path.join(out, 'red-berry-vine.js'), 'utf8'), '// customized existing design\n');
  const panel = await import(pathToFileURL(path.join(out, 'painted-sprawling-floral-panel.js')));
  assert.equal(panel.resolveOrnament('image').asset.format, 'webp');
  assert.equal(await readFile(path.join(out, 'unrelated.txt'), 'utf8'), 'Retain me');
  const files = await readdir(assets, { recursive: true });
  assert.ok(!files.some(name => name.startsWith('png/') || name.includes('plate-')));
  assert.deepEqual(JSON.parse(await readFile(path.join(assets, 'catalog.json'))).map(item => item.name), ['painted-sprawling-floral-panel', 'red-berry-vine']);
  assert.deepEqual((await readdir(path.join(out, 'lib/design-data'))).sort(), ['painted-sprawling-floral-panel.js', 'red-berry-vine.js']);
  for (const item of JSON.parse(await readFile(path.join(assets, 'catalog.json')))) {
    for (const source of [item, ...Object.values(item.components)]) for (const variant of [source, ...source.variants]) {
      for (const format of item.formats) if (variant[format]) assert.deepEqual(await readFile(path.join(assets, variant[format])), await readFile(new URL(variant[format], root)));
    }
  }
});

test('add protects edited code before requesting artwork and overwrites only explicitly', async t => {
  const { out, assets, args } = await installation(t);
  await main(['add', 'red-berry-vine', ...args]);
  const file = path.join(out, 'red-berry-vine.js');
  await writeFile(file, '// local customizations\n');
  const requests = [];
  const server = createServer((request, response) => { requests.push(request.url); response.writeHead(500); response.end(); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  await assert.rejects(main(['add', 'red-berry-vine', '--out', out, '--assets', assets, '--framework', 'vanilla', '--from', `http://127.0.0.1:${server.address().port}`]), /Existing file differs/);
  assert.deepEqual(requests, []);
  assert.equal(await readFile(file, 'utf8'), '// local customizations\n');
  await main(['add', 'red-berry-vine', ...args, '--overwrite']);
  assert.ok((await readFile(file, 'utf8')).includes('export *'));
  await assert.rejects(main(['add', 'red-berry-vine', ...args, '--assets-base', '/another/']), /different version, framework or hosting/);
});

test('add supports PNG-only auto selection and rejects overlap, invalid URLs and formats', async t => {
  const { out, args } = await installation(t);
  await main(['add', 'red-berry-vine', ...args, '--format', 'png']);
  const api = await import(pathToFileURL(path.join(out, 'red-berry-vine.js')));
  assert.equal(api.resolveOrnament('divider').asset.format, 'png');
  assert.ok(api.resolveOrnament('frame', { size: 10 }).asset.path.startsWith('png/128/'));
  await assert.rejects(main(['add', 'red-berry-vine', ...args, '--assets', out]), /separate directories/);
  await assert.rejects(main(['add', 'red-berry-vine', ...args, '--assets-base', 'public/ornaments']), /assetsBase must/);
  await assert.rejects(main(['add', 'floral-bird-panel-blue', ...args, '--format', 'svg']), /does not support/);
});
