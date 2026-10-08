import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeMetadata, decodeMetadata } from '../lib/metadata-codec.js';

test('compact metadata preserves nested fields, array values and future keys', () => {
  const value = {name: 'example', variants: [{width: 128, png: 'png/example.png'}],
    subjects: ['A', ''], custom: {arbitrary: [0, '', ['ABC'], null, false, 42]}, components: {}};
  const decoded = decodeMetadata(JSON.parse(JSON.stringify(encodeMetadata(value))));
  assert.deepEqual(decoded, value);
  assert.deepEqual(Object.keys(decoded), Object.keys(value));
  assert.deepEqual(decodeMetadata(encodeMetadata({})), {});
  assert.deepEqual(decodeMetadata(encodeMetadata([])), []);
});
