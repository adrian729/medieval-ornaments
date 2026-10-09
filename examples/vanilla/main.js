import { createFrame, createDivider, createOrnamentImage, findOrnaments, getOrnament, resolveOrnament } from '@ranx729/medieval-ornaments';
import { createDivider as createBerryDivider } from '@ranx729/medieval-ornaments/designs/red-berry-vine';
import { createOrnamentImage as createFlyingPig } from '@ranx729/medieval-ornaments/designs/flying-pig';
import { assetsBase } from '../shared/env.js';
import { $, $$, element, codePanel, copyText, imageSizes, kilobytes } from '../shared/ui.js';
import { createPicker } from '../shared/picker.js';
import { htmlSnippet } from '../shared/snippets.js';

// The offline ZIP self-hosts its artwork; published pages use the default CDN.
const hosting = assetsBase ? { assetsBase } : {};

// Picker thumbnails use the library with the smallest published files.
function thumbnail(item, target, { lazy }) {
  const options = { pixelRatio: 1, format: 'webp', ...(lazy ? { loading: 'lazy' } : {}), ...hosting };
  if (item.kind === 'repeat-tile') {
    const strip = element('span'); target.append(strip);
    // The small trigger box must still fit one whole repeat (dividers paint whole units only).
    const size = lazy ? 24 : Math.min(16, 50 / item.repeat_ratio);
    const controller = createDivider(strip, { design: item.name, size, orientation: 'horizontal', ...options });
    return () => controller.destroy();
  }
  const image = element('img', { alt: '' }); target.append(image);
  const size = Math.max(8, Math.floor(Math.min(88, 112 * item.height / item.width)));
  const controller = createOrnamentImage(image, { design: item.name, size, decoding: 'async', ...options });
  return () => controller.destroy();
}

// ---------- Borders: one design as a frame and as a divider ----------
const borderPicker = createPicker({ id: 'design', label: 'Border', value: 'red-berry-vine', items: findOrnaments({ use: 'divider' }),
  search: query => findOrnaments({ use: 'divider', query }), thumbnail, onChange: () => updateBorders() });
$('#designPicker').append(borderPicker.element);
const borders = () => ({ design: borderPicker.value, orientation: $('#orientation').value, size: Number($('#size').value) });
let options = borders();
let frame = createFrame($('#frame'), { design: options.design, size: options.size, ...hosting });
const divider = createDivider($('#divider'), { design: options.design, orientation: options.orientation, size: options.size, ...hosting });
const borderCode = codePanel($('#borderCode'));

function updateBorders() {
  options = borders();
  const { design, orientation, size } = options;
  $('#sizeOut').value = `${size}px`;
  frame?.update({ design, size });
  divider.update({ design, orientation, size });
  $('#details').textContent = `${divider.configuration.axis === 'x' ? 'Horizontal' : 'Vertical'} divider using ${divider.configuration.asset.path}`;
  const js = `import { createFrame, createDivider } from '@ranx729/medieval-ornaments';
import '@ranx729/medieval-ornaments/styles.css';

const frame = createFrame(document.querySelector('#frame'), {
  design: '${design}', size: ${size}
});
const divider = createDivider(document.querySelector('#divider'), {
  design: '${design}', orientation: '${orientation}', size: ${size}
});

// Later: change options in place, or remove the ornament.
divider.update({ orientation: 'horizontal' });
frame.destroy();`;
  // The same result without JavaScript, from the library's own resolution.
  const blocks = [htmlSnippet(resolveOrnament('frame', { design, size, ...hosting }), '…'), htmlSnippet(resolveOrnament('divider', { design, orientation, size, ...hosting }))];
  borderCode.set({ js, html: [blocks[0].split('\n')[0], ...blocks.map(block => block.split('\n').slice(2).join('\n'))].join('\n\n') });
}
for (const id of ['orientation', 'size']) $('#' + id).addEventListener('input', updateBorders);
$('#toggle').addEventListener('click', () => {
  if (frame) { frame.destroy(); frame = null; $('#toggle').textContent = 'Attach frame'; }
  else { frame = createFrame($('#frame'), { design: options.design, size: options.size, ...hosting }); $('#toggle').textContent = 'Detach frame'; }
});

// ---------- Images: one of the sizes published for the chosen image ----------
const imagePicker = createPicker({ id: 'wholeDesign', label: 'Image', value: 'floral-bird-panel-blue', items: findOrnaments({ use: 'image' }),
  search: query => findOrnaments({ use: 'image', query }), thumbnail, onChange: () => updateImage() });
$('#imagePicker').append(imagePicker.element);
let tier = '256';
const initial = chosenSize(getOrnament(imagePicker.value));
const whole = createOrnamentImage($('#whole'), { design: imagePicker.value, size: initial.size, pixelRatio: 1, loading: 'lazy', decoding: 'async', ...hosting });
const imageCode = codePanel($('#imageCode'));

// pixelRatio 1 loads exactly the chosen file and shows it at its pixel size.
function chosenSize(item) {
  const sizes = imageSizes(item);
  const chosen = sizes.find(size => size.label === tier) || sizes.findLast(size => Number(size.label) <= Number(tier)) || sizes[0];
  return { size: chosen.size, pixelRatio: 1, chosen, sizes };
}
function updateImage() {
  const item = getOrnament(imagePicker.value), { size, chosen, sizes } = chosenSize(item);
  $('#imageSize').replaceChildren(...sizes.map(option => element('button', { type: 'button', 'data-value': option.label, 'aria-pressed': String(option === chosen),
    text: option.label, title: `${option.width} × ${option.height} px · ${kilobytes(option.bytes)}`, onclick: () => { tier = option.label; updateImage(); } })));
  whole.update({ design: item.name, size, pixelRatio: 1 });
  // Explicit proportions keep the lazy image sized while the stage scales large files down.
  $('#whole').style.aspectRatio = `${item.width} / ${item.height}`;
  $('#imageDetails').textContent = `${chosen.path} · ${chosen.width} × ${chosen.height} px · ${kilobytes(chosen.bytes)}`;
  const options = `design: '${item.name}', size: ${Math.round(size * 100) / 100}, pixelRatio: 1`;
  imageCode.set({
    js: `import { createOrnamentImage } from '@ranx729/medieval-ornaments';
import '@ranx729/medieval-ornaments/styles.css';

// Loads ${chosen.path} (${chosen.width} × ${chosen.height} px).
createOrnamentImage(document.querySelector('#image'), {
  ${options}, loading: 'lazy'
});`,
    html: htmlSnippet(resolveOrnament('image', { design: item.name, size, pixelRatio: 1, ...hosting }))
  });
}

for (const button of $$('[data-copy-text]')) button.addEventListener('click', () => copyText(button.dataset.copyText, button));
updateBorders();
updateImage();
createBerryDivider($('#selective-divider'), hosting);
createFlyingPig($('#selective-illustration'), { size: 128, loading: 'lazy', decoding: 'async', ...hosting });
document.body.dataset.ready = 'true';
