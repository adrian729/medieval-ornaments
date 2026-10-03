// Reproducible production JS/CSS comparison with React as an external peer.
import { mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { build } from 'vite';
import { ornaments } from '../lib/catalog.js';
const root = fileURLToPath(new URL('../', import.meta.url)), out = path.join(root, 'tmp/selective-audit');
await mkdir(out, { recursive: true });
const reports = [];
for (const adapter of ['vanilla', 'react']) for (const selective of [false, true]) {
  const entry = path.join(out, `${adapter}-${selective ? 'individual' : 'full'}.js`);
  const source = path.join(root, 'lib', adapter === 'react' ? selective ? 'react-designs/red-berry-vine-styled.js' : 'react-styled.js' : selective ? 'designs/red-berry-vine.js' : 'index.js');
  const options = selective ? '{size:33}' : "{design:'red-berry-vine',size:33}";
  await writeFile(entry, adapter === 'react' ? `import {createElement as h} from 'react';import {OrnamentDivider} from ${JSON.stringify(source)};export default function Example(){return h(OrnamentDivider,${options});}` : `import {createDivider} from ${JSON.stringify(source)};import ${JSON.stringify(path.join(root,'ornaments.css'))};export default function mount(element){return createDivider(element,${options});}`);
  const built = await build({ configFile: false, logLevel: 'silent', build: { write: false, minify: true, lib: { entry, formats: ['es'] }, rollupOptions: { external: ['react'] } } });
  const emitted = (Array.isArray(built) ? built : [built]).flatMap(result => result.output);
  const code = emitted.filter(file => file.type === 'chunk').map(file => file.code).join('\n');
  const css = emitted.filter(file => file.type === 'asset' && file.fileName.endsWith('.css')).map(file => String(file.source)).join('\n');
  const count = ornaments.filter(item => code.includes(item.name)).length;
  assert.equal(count, selective ? 1 : 70);
  assert.ok(css.includes('.ornament-divider'), 'Styled CSS must survive production tree shaking');
  reports.push({ adapter, import: selective ? 'individual' : 'full', jsBytes: Buffer.byteLength(code), jsGzipBytes: gzipSync(code).length, cssBytes: Buffer.byteLength(css), cssGzipBytes: gzipSync(css).length, includedDesigns: count });
}
await writeFile(path.join(out, 'report.json'), JSON.stringify(reports, null, 2) + '\n');
console.log(JSON.stringify(reports, null, 2));
