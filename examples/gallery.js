// Gallery: browse, filter and inspect every design with the public API.
// Thumbnails request the smallest published files (pixelRatio 1, 128px tier);
// a design's full-resolution artwork loads only when it is opened.
import { findOrnaments, getOrnament, resolveOrnament, getAssetSource } from '../lib/index.js';
import { assetsBase, withHosting } from './shared/env.js';
import { $, $$, element, readable, typeLabel, debounce, loadImage, prefetch, idle, segmented, codePanel, kilobytes } from './shared/ui.js';
import { htmlSnippet, jsSnippet, reactSnippet, cliSnippet } from './shared/snippets.js';

const PAGE_SIZE = 24, THUMB = { width: 128, height: 112 }, STRIP = 32;
// Detail images fit this box; at the default 2x density that stays within the 768px files.
const IMAGE_BOX = { width: 384, height: 300 };
const TYPES = ['border', 'decoration', 'illustration'];
const derivations = {
  'ai-assisted-extraction': 'AI-assisted extraction', 'source-crop-and-color-trace': 'Source crop and colour trace',
  'supplied-authored-raster': 'Authored raster artwork', 'vector-reconstruction': 'Vector reconstruction',
  'independent-ai-interpretation': 'Independent AI interpretation', 'preserved-source-scene': 'Preserved source scene'
};

const state = { type: 'all', q: '', category: '', page: 1, design: null };
const view = { mode: 'frame', size: 32, orientation: 'horizontal', background: 'paper' };
let results = [], current = null, openedByPush = false, request = 0;

// ---------- URL state ----------
function readUrl() {
  const params = new URLSearchParams(location.search);
  state.type = TYPES.includes(params.get('type')) ? params.get('type') : 'all';
  state.q = params.get('q') ?? params.get('search') ?? '';
  state.category = params.get('category') ?? '';
  state.page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  state.design = params.get('design');
}
function writeUrl(push = false) {
  const params = new URLSearchParams();
  if (state.type !== 'all') params.set('type', state.type);
  if (state.q) params.set('q', state.q);
  if (state.category) params.set('category', state.category);
  if (state.page > 1) params.set('page', state.page);
  if (state.design) params.set('design', state.design);
  const hosting = new URLSearchParams(location.search).get('assets');
  if (hosting) params.set('assets', hosting);
  const query = params.toString();
  history[push ? 'pushState' : 'replaceState']({ design: state.design }, '', location.pathname + (query ? '?' + query : ''));
}

// ---------- Filtering ----------
const search = (extra = {}) => findOrnaments({ query: state.q, ...extra });
function filtered() {
  const options = {};
  if (state.type !== 'all') options.assetType = state.type;
  if (state.category) options.categories = [state.category];
  return search(options);
}
function renderFilters() {
  for (const button of $$('#typeTabs button')) {
    const type = button.dataset.value;
    button.setAttribute('aria-pressed', String(type === state.type));
    $('.count', button).textContent = ' ' + search(type === 'all' ? {} : { assetType: type }).length;
  }
  const pool = search(state.type === 'all' ? {} : { assetType: state.type });
  const counts = new Map();
  for (const item of pool) for (const category of item.categories) counts.set(category, (counts.get(category) || 0) + 1);
  if (state.category && !counts.has(state.category)) state.category = '';
  $('#category').replaceChildren(new Option('All categories', ''),
    ...[...counts].sort(([a], [b]) => a.localeCompare(b)).map(([category, count]) => new Option(`${category[0].toUpperCase()}${category.slice(1)} (${count})`, category)));
  $('#category').value = state.category;
  if ($('#search').value !== state.q) $('#search').value = state.q;
  $('#clearFilters').hidden = !(state.q || state.category || state.type !== 'all');
}

// ---------- Thumbnails ----------
function thumbnail(item) {
  if (item.kind === 'repeat-tile') {
    const resolved = resolveOrnament('divider', withHosting({ design: item.name, size: STRIP, orientation: 'horizontal', pixelRatio: 1, format: 'webp' }));
    const strip = element('span', { class: resolved.className, 'data-axis': resolved.attributes['data-axis'], 'aria-hidden': 'true' });
    for (const [key, value] of Object.entries(resolved.style)) strip.style.setProperty(key, value);
    return { node: strip, url: resolved.asset.url, ready: loadImage(resolved.asset.url) };
  }
  const size = Math.max(8, Math.floor(Math.min(THUMB.height, THUMB.width * item.height / item.width)));
  const { attributes, asset } = resolveOrnament('image', withHosting({ design: item.name, size, pixelRatio: 1, format: 'webp', decoding: 'async' }));
  const image = element('img', { src: attributes.src, width: attributes.width, height: attributes.height, alt: '', decoding: 'async' });
  return { node: image, url: asset.url, ready: image.decode() };
}
const thumbnailUrl = item => item.kind === 'repeat-tile'
  ? resolveOrnament('divider', withHosting({ design: item.name, size: STRIP, orientation: 'horizontal', pixelRatio: 1, format: 'webp' })).asset.url
  : resolveOrnament('image', withHosting({ design: item.name, size: Math.max(8, Math.floor(Math.min(THUMB.height, THUMB.width * item.height / item.width))), pixelRatio: 1, format: 'webp' })).asset.url;

function card(item, thumb) {
  const button = element('button', { type: 'button', class: 'tile', 'data-design': item.name },
    element('span', { class: 'tile-art' }, thumb.node),
    element('span', { class: 'tile-meta' },
      element('span', { class: 'tile-name', text: readable(item.name) }),
      element('span', { class: 'tile-type', text: `${typeLabel[item.asset_type]} · ${item.categories[0]}` })));
  button.addEventListener('click', () => open(item.name, true));
  // Hover intent: start the detail download before the click lands.
  let timer;
  button.addEventListener('pointerenter', () => { timer = setTimeout(() => prefetch(previewFor(item).asset.url), 120); });
  button.addEventListener('pointerleave', () => clearTimeout(timer));
  button.addEventListener('focus', () => prefetch(previewFor(item).asset.url));
  return button;
}

let renderToken = 0;
function renderGrid() {
  results = filtered();
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * PAGE_SIZE, items = results.slice(start, start + PAGE_SIZE);
  const thumbs = items.map(thumbnail);
  $('#grid').replaceChildren(...items.map((item, index) => element('li', {}, card(item, thumbs[index]))));
  // A failed request must be visible, never a silently empty card.
  thumbs.forEach((thumb, index) => thumb.ready.catch(() => $('#grid').children[index]?.querySelector('.tile-art')?.classList.add('missing')));
  $('#empty').hidden = results.length > 0;
  $('#resultCount').textContent = results.length === 0 ? 'No matching designs'
    : `${results.length} design${results.length === 1 ? '' : 's'}${pages > 1 ? ` · page ${state.page} of ${pages}` : ''}`;
  renderPager(pages);
  // Once this page has settled, quietly fetch the next page's thumbnails.
  const token = ++renderToken;
  const settle = Promise.race([Promise.allSettled(thumbs.map(thumb => thumb.ready)), new Promise(resolve => setTimeout(resolve, 6000))]);
  settle.then(() => idle(() => {
    if (token !== renderToken) return;
    for (const item of results.slice(start + PAGE_SIZE, start + 2 * PAGE_SIZE)) prefetch(thumbnailUrl(item));
  }));
}

function renderPager(pages) {
  const pager = $('#pager');
  pager.hidden = pages <= 1;
  if (pages <= 1) return pager.replaceChildren();
  const button = (label, page, extra = {}) => element('button', { type: 'button', class: 'btn btn-sm', text: label, disabled: page < 1 || page > pages, ...extra,
    onclick: () => { state.page = page; writeUrl(); renderGrid(); $('.toolbar').scrollIntoView({ block: 'start' }); } });
  const shown = [...new Set([1, state.page - 1, state.page, state.page + 1, pages])].filter(page => page >= 1 && page <= pages).sort((a, b) => a - b);
  const children = [button('Previous', state.page - 1, { 'aria-label': 'Previous page' })];
  shown.forEach((page, index) => {
    if (index && page - shown[index - 1] > 1) children.push(element('span', { class: 'gap', text: '…' }));
    children.push(button(String(page), page, page === state.page ? { 'aria-current': 'page' } : { 'aria-label': `Page ${page}` }));
  });
  children.push(button('Next', state.page + 1, { 'aria-label': 'Next page' }));
  pager.replaceChildren(...children);
}

function update({ resetPage = true } = {}) {
  if (resetPage) state.page = 1;
  renderFilters(); writeUrl(); renderGrid();
}

// ---------- Detail ----------
const dialog = $('#detail'), stage = $('#detailStage'), code = codePanel($('#detailCode'));
// Never enlarge a raster beyond its native pixels at this screen's density.
const imageSize = item => Math.max(16, Math.floor(Math.min(IMAGE_BOX.height, IMAGE_BOX.width * item.height / item.width, item.height / (window.devicePixelRatio || 1))));
function previewFor(item, mode = view.mode) {
  if (item.kind !== 'repeat-tile') return resolveOrnament('image', withHosting({ design: item.name, size: imageSize(item) }));
  if (mode === 'frame') return resolveOrnament('frame', withHosting({ design: item.name, size: view.size }));
  return resolveOrnament('divider', withHosting({ design: item.name, size: view.size, orientation: view.orientation }));
}
const fileUrl = path => assetsBase ? assetsBase.replace(/\/?$/, '/') + path : getAssetSource(current.name).base + path;
function fileInfo(item, path) {
  const format = path.split('.').pop();
  const assets = [item, ...Object.values(item.components || {})].flatMap(asset => [asset, ...(asset.variants || [])]);
  const match = assets.find(asset => asset[format] === path);
  return match && match[`${format}_bytes`] ? `${match.width} × ${match.height} px · ${kilobytes(match[`${format}_bytes`])}` : '';
}

function applyCss(target, resolved, base) {
  target.className = [base, resolved.className].filter(Boolean).join(' ');
  for (const key of ['--ornament-size', '--ornament-image', '--ornament-slice', '--ornament-ratio', '--ornament-length']) target.style.removeProperty(key);
  for (const [key, value] of Object.entries(resolved.style)) target.style.setProperty(key, value);
  target.removeAttribute('data-axis');
  for (const [key, value] of Object.entries(resolved.attributes)) target.setAttribute(key, value);
}

function status(kind, retry) {
  $('.loading', stage)?.remove(); $('.failed', stage)?.remove();
  if (kind === 'loading') stage.append(element('span', { class: 'loading', text: 'Loading full resolution…' }));
  if (kind === 'failed') stage.append(element('span', { class: 'failed' }, 'This image could not be loaded.', element('button', { type: 'button', class: 'btn btn-sm', text: 'Retry', onclick: retry })));
}

async function renderPreview() {
  const item = current, border = item.kind === 'repeat-tile', use = border ? view.mode : 'image';
  const token = ++request, resolved = previewFor(item);
  stage.dataset.bg = view.background;
  $('#modeTabs').hidden = !border;
  $('#borderControls').hidden = !border;
  $('#orientationField').hidden = use !== 'divider';
  $('#detailFrame').hidden = use !== 'frame';
  $('#dividerWrap').hidden = use !== 'divider';
  $('#detailImage').hidden = use !== 'image';
  $('#dividerWrap').style.height = use === 'divider' && view.orientation === 'vertical' ? '280px' : '';
  $('#dividerWrap').style.width = use === 'divider' && view.orientation === 'horizontal' ? '100%' : '';
  const image = $('#detailImage');
  if (use === 'image' && image.dataset.design !== item.name) {
    // The thumbnail is already cached: show it at once, then sharpen.
    image.dataset.design = item.name;
    image.width = item.width; image.height = item.height; image.className = 'ornament-image';
    image.style.setProperty('--ornament-size', `${resolved.size}px`);
    image.src = thumbnailUrl(item);
    image.alt = item.description;
  }
  const label = `${resolved.asset.path} · ${fileInfo(item, resolved.asset.path) || resolved.asset.format.toUpperCase()}`;
  $('#fullSize').textContent = `Showing ${label}${resolved.asset.resolutionLimited ? ' · largest available file' : ''}`;
  updateCode(use, resolved);
  const shown = { frame: $('#detailFrame'), divider: $('#detailDivider'), image }[use];
  if (use !== 'image' && shown.dataset.design !== item.name) {
    // Never show the previous design's artwork under the new name.
    shown.dataset.design = item.name; delete shown.dataset.url;
    shown.style.removeProperty('--ornament-image');
  }
  if (shown.dataset.url === resolved.asset.url) { if (use !== 'image') applyCss(shown, resolved, use === 'frame' ? 'sample-frame' : ''); return status(); }
  const timer = setTimeout(() => token === request && status('loading'), 150);
  try { await loadImage(resolved.asset.url); }
  catch { clearTimeout(timer); if (token === request) status('failed', renderPreview); return; }
  clearTimeout(timer);
  if (token !== request) return;
  shown.dataset.url = resolved.asset.url;
  if (use === 'image') { image.style.setProperty('--ornament-size', `${resolved.size}px`); image.src = resolved.asset.url; }
  else applyCss(shown, resolved, use === 'frame' ? 'sample-frame' : '');
  status();
}

function updateCode(use, resolved) {
  const name = current.name;
  const options = use === 'frame' ? { size: view.size } : use === 'divider' ? { orientation: view.orientation, size: view.size } : { size: resolved.size };
  code.set({ html: htmlSnippet(resolved), js: jsSnippet(use, name, options), react: reactSnippet(use, name, options), cli: cliSnippet(name) });
}

function fact(label, ...value) { return [element('dt', { text: label }), element('dd', {}, ...value)]; }
function renderInfo(item) {
  $('#detailType').textContent = typeLabel[item.asset_type];
  $('#detailTitle').textContent = readable(item.name);
  $('#detailDescription').textContent = item.description;
  const border = item.kind === 'repeat-tile';
  const rows = [
    fact('Name', element('code', { text: item.name })),
    fact('Use', border ? 'Frame or repeating divider' : 'Whole image'),
    border ? fact('Repeats', item.repeat_axis === 'y' ? 'Vertically (a rotated tile serves horizontal dividers)' : 'Horizontally (a rotated tile serves vertical dividers)')
      : fact('Original size', `${item.width} × ${item.height} px`),
    fact('Background', item.has_transparency ? 'Transparent' : 'Opaque'),
    fact('Colours', element('span', { class: 'chips' }, ...item.colors.map(color => element('span', { class: 'chip', text: color })))),
    fact('Categories', element('span', { class: 'chips' }, ...item.categories.map(category => element('button', { type: 'button', class: 'chip', text: category,
      onclick: () => { openedByPush = false; state.category = category; state.type = item.asset_type; close(); update(); } })))),
    fact('Subjects', item.subjects.join(', ')),
    !border && item.facing !== 'unclear' ? fact('Facing', item.facing) : null,
    fact('Made by', derivations[item.derivation] || item.derivation),
    item.author ? fact('Author', item.author) : null
  ];
  if (item.provenance) {
    const source = item.provenance;
    rows.push(fact('Source', element('a', { href: source.record_url, text: source.title }), ` · ${[source.institution, source.object_identifier, source.date, source.artist].filter(Boolean).join(' · ')}`));
    rows.push(fact('Image rights', element('a', { href: source.rights_url, text: source.image_rights })));
  }
  $('#facts').replaceChildren(...rows.filter(Boolean).flat());
  $('#notes').hidden = !item.usage_notes.length;
  $('#notes summary').textContent = `Usage notes (${item.usage_notes.length})`;
  $('#notesList').replaceChildren(...item.usage_notes.map(note => element('li', { text: note })));
  renderFiles(item);
}

function renderFiles(item) {
  const components = item.components || {};
  const groups = item.kind === 'repeat-tile'
    ? [['Repeating tile', item], ['Rotated tile', components.rotated_tile], ['Frame image', components.border_image], ['Corner', components.corner], ['Original crop', components.reference_crop]]
    : [['Image', item], ['Original crop', components.reference_crop]];
  const link = (text, path) => element('a', { href: fileUrl(path), text, title: fileInfo(item, path), target: '_blank', rel: 'noopener' });
  $('#files').replaceChildren(...groups.filter(([, asset]) => asset).map(([label, asset]) => {
    const variants = [...(asset.variants || [])].sort((a, b) => a.max_dimension - b.max_dimension);
    const formats = ['webp', 'png'].filter(format => asset[format]).map(format => element('p', {}, element('span', { text: format.toUpperCase() }),
      ...variants.map(variant => link(`${variant.max_dimension}`, variant[format])), link('Original', asset[format])));
    if (asset.svg) formats.push(element('p', {}, element('span', { text: 'SVG' }), link('Vector', asset.svg)));
    return element('div', {}, element('strong', { text: label }), ...formats);
  }));
}

function open(name, push = false) {
  let item;
  try { item = getOrnament(name); } catch { return; }
  current = item; state.design = name;
  if (item.kind !== 'repeat-tile') view.mode = 'frame';
  modeControl.select(view.mode);
  writeUrl(push && !dialog.open);
  if (push && !dialog.open) openedByPush = true;
  renderInfo(item);
  if (!dialog.open) dialog.showModal();
  renderPreview();
  const index = results.findIndex(result => result.name === name);
  $('#prevDesign').disabled = index <= 0;
  $('#nextDesign').disabled = index < 0 || index >= results.length - 1;
}
function step(offset) {
  const index = results.findIndex(result => result.name === current?.name);
  const next = results[index + offset];
  if (index >= 0 && next) open(next.name);
}
function close() { if (dialog.open) dialog.close(); }
dialog.addEventListener('close', () => {
  state.design = null; current = null;
  if (openedByPush && history.state?.design) { openedByPush = false; history.back(); }
  else writeUrl();
});
dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
dialog.addEventListener('keydown', event => {
  if (event.target.matches('input, select, textarea')) return;
  if (event.key === 'ArrowLeft') step(-1);
  if (event.key === 'ArrowRight') step(1);
});
$('#closeDetail').addEventListener('click', close);
$('#prevDesign').addEventListener('click', () => step(-1));
$('#nextDesign').addEventListener('click', () => step(1));
const modeControl = segmented($('#modeTabs'), value => { view.mode = value; renderPreview(); });
segmented($('#backgroundTabs'), value => { view.background = value; stage.dataset.bg = value; });
segmented($('#orientationTabs'), value => { view.orientation = value; renderPreview(); });
const resize = debounce(renderPreview, 120);
$('#size').addEventListener('input', event => {
  view.size = Number(event.target.value);
  $('#sizeOut').value = `${view.size}px`;
  // Resize instantly with the current artwork; re-resolve once the slider rests.
  for (const target of [$('#detailFrame'), $('#detailDivider')]) target.style.setProperty('--ornament-size', `${view.size}px`);
  resize();
});

// ---------- Wiring ----------
for (const button of $$('#typeTabs button')) button.addEventListener('click', () => { state.type = button.dataset.value; update(); });
$('#category').addEventListener('change', event => { state.category = event.target.value; update(); });
$('#search').addEventListener('input', debounce(event => { state.q = event.target.value.trim(); update(); }, 160));
$('#clearFilters').addEventListener('click', () => { Object.assign(state, { type: 'all', q: '', category: '' }); update(); });
window.addEventListener('popstate', () => {
  const before = JSON.stringify([state.type, state.q, state.category, state.page]);
  readUrl();
  if (JSON.stringify([state.type, state.q, state.category, state.page]) !== before) { renderFilters(); renderGrid(); }
  openedByPush = false;
  if (state.design) open(state.design); else close();
});

readUrl();
renderFilters();
renderGrid();
if (state.design) open(state.design); else writeUrl();
document.body.dataset.ready = 'true';
