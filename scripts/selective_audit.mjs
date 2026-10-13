// Reproducible production JS/CSS comparison with React as an external peer.
import { mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { build } from 'vite';
import { getAssetSource } from '../lib/asset-routing.js';
import { ornaments } from '../lib/catalog.js';
const root = fileURLToPath(new URL('../', import.meta.url)), out = path.join(root, 'tmp/selective-audit');
await mkdir(out, { recursive: true });
const reports = [];
for (const design of ['red-berry-vine', 'flying-pig']) for (const adapter of ['vanilla', 'react']) for (const selective of [false, true]) {
  const image = design === 'flying-pig';
  const component = adapter === 'react' ? image ? 'OrnamentImage' : 'OrnamentDivider' : image ? 'createOrnamentImage' : 'createDivider';
  const entry = path.join(out, `${design}-${adapter}-${selective ? 'individual' : 'full'}.js`);
  const source = path.join(root, 'lib', adapter === 'react' ? selective ? `react-designs/${design}-styled.js` : 'react-styled.js' : selective ? `designs/${design}.js` : 'index.js');
  const options = selective ? `{size:${image ? 128 : 33}}` : `{design:'${design}',size:${image ? 128 : 33}}`;
  await writeFile(entry, adapter === 'react' ? `import {createElement as h} from 'react';import {${component}} from ${JSON.stringify(source)};export default function Example(){return h(${component},${options});}` : `import {${component}} from ${JSON.stringify(source)};import ${JSON.stringify(path.join(root,'ornaments.css'))};export default function mount(element){return ${component}(element,${options});}`);
  const built = await build({ configFile: false, logLevel: 'silent', build: { write: false, minify: true, lib: { entry, formats: ['es'] }, rollupOptions: { external: ['react'] } } });
  const emitted = (Array.isArray(built) ? built : [built]).flatMap(result => result.output);
  const code = emitted.filter(file => file.type === 'chunk').map(file => file.code).join('\n');
  const css = emitted.filter(file => file.type === 'asset' && file.fileName.endsWith('.css')).map(file => String(file.source)).join('\n');
  // Names can contain other complete names (e.g. flying-pig and pig). Count
  // actual metadata modules, not substrings in generated source or prose.
  const modules = emitted.filter(file => file.type === 'chunk').flatMap(chunk => Object.keys(chunk.modules));
  const dataModules = modules.filter(file => file.includes('/design-data/'));
  const count = dataModules.length;
  assert.equal(count, selective ? 1 : ornaments.length);
  if(selective) {
    assert.ok(dataModules[0].endsWith(`/design-data/${design}.js`));
    assert.ok(!modules.some(file=>file.endsWith('/asset-routing.js')||file.endsWith('/asset-sources.js')||file.endsWith('/runtime.js')));
    assert.equal(modules.filter(file=>file.includes('/asset-sources/')).length,1);
    assert.ok(code.includes(getAssetSource(design).base));
    assert.ok(!code.includes(getAssetSource(design).manifestSha256));
  }
  assert.ok(css.includes('.ornament-divider'), 'Styled CSS must survive production tree shaking');
  reports.push({ design, adapter, import: selective ? 'individual' : 'full', jsBytes: Buffer.byteLength(code), jsGzipBytes: gzipSync(code).length, cssBytes: Buffer.byteLength(css), cssGzipBytes: gzipSync(css).length, includedDesigns: count });
}
for (const [scope, type] of [['borders', 'border'], ['decorations', 'decoration'], ['illustrations', 'illustration']]) {
  const entry = path.join(out, `catalog-${scope}.js`);
  await writeFile(entry, `export {findOrnaments} from ${JSON.stringify(path.join(root, `lib/selection-${scope}.js`))};`);
  const built = await build({ configFile: false, logLevel: 'silent', build: { write: false, minify: true, lib: { entry, formats: ['es'] } } });
  const chunks = (Array.isArray(built) ? built : [built]).flatMap(result => result.output).filter(file => file.type === 'chunk');
  const code = chunks.map(file => file.code).join('\n');
  const modules = chunks.flatMap(chunk => Object.keys(chunk.modules));
  const expected = ornaments.filter(item => item.asset_type === type);
  assert.equal(modules.filter(file => file.includes('/design-data/')).length, expected.length);
  assert.ok(!modules.some(file => file.endsWith('/catalog.js') || file.endsWith('/index.js') || file.includes('resolve-core')));
  reports.push({ adapter: 'discovery', import: scope, jsBytes: Buffer.byteLength(code), jsGzipBytes: gzipSync(code).length, includedDesigns: expected.length });
}
await writeFile(path.join(out, 'report.json'), JSON.stringify(reports, null, 2) + '\n');
console.log(JSON.stringify(reports, null, 2));
