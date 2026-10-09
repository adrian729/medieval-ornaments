import { createFrame, createDivider, createOrnamentImage, findOrnaments, resolveOrnament } from '@ranx729/medieval-ornaments';
import { createDivider as createBerryDivider } from '@ranx729/medieval-ornaments/designs/red-berry-vine';
import { createOrnamentImage as createFlyingPig } from '@ranx729/medieval-ornaments/designs/flying-pig';
import { assetsBase } from '../shared/env.js';
import { $, $$, element, readable, codePanel, copyText } from '../shared/ui.js';
import { htmlSnippet } from '../shared/snippets.js';

// The offline ZIP self-hosts its artwork; published pages use the default CDN.
const hosting = assetsBase ? { assetsBase } : {};
const capital = text => text[0].toUpperCase() + text.slice(1);

function populate(select, items, group, selected) {
  const groups = new Map();
  for (const item of items) {
    const label = group(item);
    if (!groups.has(label)) groups.set(label, element('optgroup', { label }));
    groups.get(label).append(new Option(readable(item.name), item.name));
  }
  select.replaceChildren(...[...groups.keys()].sort().map(label => groups.get(label)));
  select.value = selected;
}
populate($('#design'), findOrnaments({ use: 'divider' }), item => capital(item.categories[0]), 'red-berry-vine');
populate($('#wholeDesign'), findOrnaments({ use: 'image' }), item => item.asset_type === 'illustration' ? 'Illustrations' : 'Decorations', 'floral-bird-panel-blue');

const read = () => ({
  design: $('#design').value, orientation: $('#orientation').value, size: Number($('#size').value),
  image: $('#wholeDesign').value, imageSize: Number($('#imageSize').value)
});
let options = read();
let frame = createFrame($('#frame'), { design: options.design, size: options.size, ...hosting });
const divider = createDivider($('#divider'), { design: options.design, orientation: options.orientation, size: options.size, ...hosting });
const whole = createOrnamentImage($('#whole'), { design: options.image, size: options.imageSize, loading: 'lazy', decoding: 'async', ...hosting });
const code = codePanel($('#playCode'));

function renderCode() {
  const { design, orientation, size, image, imageSize } = options;
  const js = `import { createFrame, createDivider, createOrnamentImage } from '@ranx729/medieval-ornaments';
import '@ranx729/medieval-ornaments/styles.css';

const frame = createFrame(document.querySelector('#frame'), {
  design: '${design}', size: ${size}
});
const divider = createDivider(document.querySelector('#divider'), {
  design: '${design}', orientation: '${orientation}', size: ${size}
});
const image = createOrnamentImage(document.querySelector('#image'), {
  design: '${image}', size: ${imageSize}, loading: 'lazy'
});

// Later: change options in place, or remove the ornament.
divider.update({ orientation: 'horizontal' });
frame.destroy();`;
  // The same result without JavaScript, from the library's own resolution.
  const blocks = [
    htmlSnippet(resolveOrnament('frame', { design, size, ...hosting }), '…'),
    htmlSnippet(resolveOrnament('divider', { design, orientation, size, ...hosting })),
    htmlSnippet(resolveOrnament('image', { design: image, size: imageSize, ...hosting }))
  ];
  const link = blocks[0].split('\n')[0];
  const html = [link, ...blocks.map(block => block.split('\n').slice(2).join('\n'))].join('\n\n');
  code.set({ js, html });
}

function update() {
  options = read();
  $('#sizeOut').value = `${options.size}px`;
  frame?.update({ design: options.design, size: options.size });
  divider.update({ design: options.design, orientation: options.orientation, size: options.size });
  whole.update({ design: options.image, size: options.imageSize });
  const { axis, asset } = divider.configuration;
  $('#details').textContent = `${axis === 'x' ? 'Horizontal' : 'Vertical'} divider using ${asset.path}`;
  renderCode();
}
for (const id of ['design', 'orientation', 'size', 'wholeDesign', 'imageSize']) $('#' + id).addEventListener('input', update);

$('#toggle').addEventListener('click', () => {
  if (frame) { frame.destroy(); frame = null; $('#toggle').textContent = 'Attach frame'; }
  else { frame = createFrame($('#frame'), { design: options.design, size: options.size, ...hosting }); $('#toggle').textContent = 'Detach frame'; }
});
for (const button of $$('[data-copy-text]')) button.addEventListener('click', () => copyText(button.dataset.copyText, button));

update();
createBerryDivider($('#selective-divider'), hosting);
createFlyingPig($('#selective-illustration'), { size: 128, loading: 'lazy', decoding: 'async', ...hosting });
document.body.dataset.ready = 'true';
