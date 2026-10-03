import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h, createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { OrnamentFrame, OrnamentDivider, OrnamentImage } from '../lib/react.js';
import { findOrnaments } from '../lib/index.js';

test('React SSR renders every design without DOM globals', () => {
  for (const item of findOrnaments()) {
    const Component = item.kind === 'standalone' ? OrnamentImage : OrnamentFrame;
    const markup = renderToString(h(Component, { design: item.name, ref: createRef(), id: 'art', className: 'custom', style: { padding: '12px' }, assetsBase: '/art/' }, item.kind === 'standalone' ? undefined : h('input', { defaultValue: 'Preserved content' })));
    assert.ok(markup.includes('ornament-'));
    assert.ok(markup.includes('/art/'));
    assert.ok(markup.includes('padding:12px'));
    assert.ok(!markup.includes('assetsBase=') && !markup.includes('pixelRatio='));
  }
});

test('React original and forced divider axes match the normalized contract', () => {
  assert.match(renderToString(h(OrnamentDivider, { design: 'plate-02-stepped-ribbon' })), /data-axis="y"/);
  const horizontal = renderToString(h(OrnamentDivider, { design: 'plate-02-stepped-ribbon', orientation: 'horizontal' }));
  assert.match(horizontal, /data-axis="x"/);
  assert.match(horizontal, /stepped-ribbon-rotated/);
  assert.match(horizontal, /--ornament-length:100%/);
  assert.match(renderToString(h(OrnamentImage, { design: 'floral-bird-panel-blue', size: 128, alt: 'Birds and flowers' })), /alt="Birds and flowers"/);
});

test('React refuses unsupported props and owns reserved geometry', () => {
  assert.throws(() => renderToString(h(OrnamentImage, { design: 'floral-bird-panel-blue', src: 'elsewhere' })), /source and proportions/);
  assert.throws(() => renderToString(h(OrnamentDivider, { design: 'red-berry-vine' }, 'Unexpected content')), /Only OrnamentFrame/);
  assert.throws(() => renderToString(h(OrnamentFrame, { design: 'red-berry-vine', orientation: 'vertical' })), /orientation/);
  const markup = renderToString(h(OrnamentDivider, { design: 'red-berry-vine', size: 24, style: { '--ornament-size': '500px', color: 'red' }, 'aria-hidden': false }));
  assert.match(markup, /--ornament-size:24px/);
  assert.match(markup, /aria-hidden="false"/);
  assert.match(markup, /color:red/);
});
