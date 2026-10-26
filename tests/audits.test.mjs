import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ornaments } from '../lib/index.js';
import { resourceFile } from '../scripts/resource-store.mjs';

const json = async relative => JSON.parse(await readFile(new URL('../' + relative, import.meta.url)));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
// [retained input, its hash] and [master, its hash] recorded by each import audit.
// The finished import is checked by scripts/check_finished_assets.py.
const records = {
  'historical-additions.json': (a, item) => [[a.generated_input, a.generated_sha256], [item.png, a.master_sha256]],
  'illustration-additions.json': a => [[a.generated_input, a.generated_sha256], [a.master_path, a.master_sha256]],
  'authored-additions.json': a => [[a.native_input, a.source_sha256], [a.master_path, a.master_sha256]],
  'acanthus-additions.json': a => [[a.native_input, a.native_sha256], [a.master_path, a.master_sha256]],
  'bestiary-additions.json': a => [[a.native_input, a.native_sha256], [a.master_path, a.master_sha256]],
};

test('audited import bytes are unchanged and attribution is never backfilled', async () => {
  const audits = Object.fromEntries(await Promise.all(Object.keys(records).map(async file => [file, await json(file)])));
  const byName = new Map(ornaments.map(item => [item.name, item]));
  for (const [file, audit] of Object.entries(audits)) {
    for (const source of Object.values(audit.sources || {})) assert.equal(hash(await readFile(new URL('../' + source.path, import.meta.url))), source.sha256, `${file} ${source.path}`);
    for (const asset of audit.assets) {
      for (const [relative, expected] of records[file](asset, byName.get(asset.name))) assert.equal(hash(await readFile(resourceFile(relative))), expected, `${file} ${relative}`);
    }
  }
  const finished = await json('finished-additions.json'), borders = await json('historical-border-patterns.json');
  const provenanced = new Set([...audits['historical-additions.json'].assets, ...finished.assets, ...borders].map(item => item.name));
  const authored = new Set(['polyhymnia', ...['authored-additions.json', 'acanthus-additions.json', 'bestiary-additions.json'].flatMap(file => audits[file].assets.map(item => item.name))]);
  for (const item of ornaments) {
    if (Object.hasOwn(item, 'provenance')) assert.ok(provenanced.has(item.name), `${item.name} provenance has no audit`);
    assert.equal(item.author, authored.has(item.name) ? 'adrian729' : undefined, `${item.name} author`);
  }
});
