// Overview page. Uses individual design imports (the recommended path for a
// fixed selection) and the library's own controllers; only the hero artwork
// loads eagerly.
import * as redBerryVine from '../lib/designs/red-berry-vine.js';
import * as oliveLeafAndRedBerryVine from '../lib/designs/olive-leaf-and-red-berry-vine.js';
import * as plate27 from '../lib/designs/plate-27-blue-flower-medallions.js';
import * as plate03 from '../lib/designs/plate-03-spiral-bands.js';
import * as interlockingRibbon from '../lib/designs/interlocking-ribbon.js';
import * as plate19 from '../lib/designs/plate-19-cream-scrolls.js';
import * as goldLeafScroll from '../lib/designs/gold-leaf-scroll.js';
import * as redRosetteVine from '../lib/designs/red-rosette-vine.js';
import * as plate24 from '../lib/designs/plate-24-gold-ring-scrolls.js';
import * as purpleOvalRosetteVine from '../lib/designs/purple-oval-rosette-vine.js';
import * as blueLoopedQuatrefoils from '../lib/designs/blue-looped-quatrefoils.js';
import * as plate10 from '../lib/designs/plate-10-blue-palmettes.js';
import * as flyingPig from '../lib/designs/flying-pig.js';
import * as rabbitReadingBook from '../lib/designs/rabbit-reading-book.js';
import * as hoodedHarpPlayer from '../lib/designs/hooded-harp-player.js';
import * as isabellaSmallBird from '../lib/designs/isabella-small-bird.js';
import * as floralBirdPanelBlue from '../lib/designs/floral-bird-panel-blue.js';
import * as wingedRabbit from '../lib/designs/winged-rabbit.js';
import * as illuminatedAcanthusCorner from '../lib/designs/illuminated-acanthus-corner.js';
import * as goldCinquefoilDividerCenter from '../lib/designs/gold-cinquefoil-divider-center.js';
import * as rosselliRoundelTop from '../lib/designs/rosselli-roundel-top.js';
import * as catReadingBook from '../lib/designs/cat-reading-book.js';
import * as isabellaPinkRose from '../lib/designs/isabella-pink-rose.js';
import { assetSources } from '../lib/asset-sources.js';
import { version } from '../lib/runtime.js';
import { withHosting } from './shared/env.js';
import { $, $$, element, readable, codePanel, copyText, loadImage, idle } from './shared/ui.js';
import { htmlSnippet, jsSnippet, reactSnippet } from './shared/snippets.js';

const named = modules => modules.map(module => [module.ornament.name, module]);
const curated = {
  frame: named([redBerryVine, oliveLeafAndRedBerryVine, plate27, plate03, interlockingRibbon, plate19]),
  divider: named([goldLeafScroll, redRosetteVine, plate24, purpleOvalRosetteVine, blueLoopedQuatrefoils, plate10]),
  image: named([flyingPig, rabbitReadingBook, hoodedHarpPlayer, isabellaSmallBird, floralBirdPanelBlue, wingedRabbit])
};
const inside = {
  border: [redBerryVine, plate27, oliveLeafAndRedBerryVine, plate19],
  decoration: [illuminatedAcanthusCorner, goldCinquefoilDividerCenter, floralBirdPanelBlue, rosselliRoundelTop],
  illustration: [flyingPig, catReadingBook, isabellaPinkRose, hoodedHarpPlayer]
};
const IMAGE_SIZE = 160, DIVIDER_SIZE = 28;

// Hero: the first impression loads eagerly and at high priority.
redBerryVine.createFrame($('#heroFrame'), withHosting({ size: 30 }));
flyingPig.createOrnamentImage($('#heroImage'), withHosting({ size: 128, fetchPriority: 'high', decoding: 'async' }));

// "What's inside": cheap 128px files, loaded only near the viewport.
for (const [kind, modules] of Object.entries(inside)) {
  const art = $(`.kind-art[data-kind="${kind}"]`);
  for (const module of modules) {
    const cell = element('span');
    if (kind === 'border') {
      const frame = element('span', { class: 'mini-frame' });
      module.createFrame(frame, withHosting({ size: 16, pixelRatio: 1, format: 'webp', loading: 'lazy' }));
      cell.append(frame);
    } else {
      const image = element('img', { alt: '' });
      const { width, height } = module.ornament, size = Math.round(Math.min(88, 88 * height / width));
      module.createOrnamentImage(image, withHosting({ size, pixelRatio: 1, loading: 'lazy', decoding: 'async' }));
      cell.append(image);
    }
    art.append(cell);
  }
}

// Live usage examples. A design swap waits for the new artwork to decode so
// the stage never flashes empty.
const examples = {
  frame: { target: $('#frameExample'), stage: $('#frameStage'), options: () => ({ size: Number($('#thickness').value) }) },
  divider: { target: $('#dividerExample'), stage: $('#dividerStage'), options: () => ({ size: DIVIDER_SIZE }) },
  image: { target: $('#imageExample'), stage: $('#imageStage'), options: () => ({ size: IMAGE_SIZE }) }
};
const factories = { frame: 'createFrame', divider: 'createDivider', image: 'createOrnamentImage' };
const content = { frame: '<strong>Notes from the garden</strong>' };

for (const [use, example] of Object.entries(examples)) {
  example.code = codePanel($(`.code-panel[data-code="${use}"]`));
  example.module = curated[use][0][1];
  const picker = $(`[data-picker="${use}"]`);
  for (const [name, module] of curated[use]) {
    picker.append(element('button', { type: 'button', class: 'chip', 'aria-pressed': String(module === example.module), 'data-design': name,
      text: readable(name), onclick: () => choose(use, module) }));
  }
  render(use);
}

function render(use) {
  const example = examples[use], { module } = example, options = example.options(), name = module.ornament.name;
  example.controller?.destroy();
  const rendering = use === 'image' ? { ...options, loading: 'lazy', decoding: 'async' } : { ...options, loading: 'lazy' };
  example.controller = module[factories[use]](example.target, withHosting(rendering));
  const resolved = module.resolveOrnament(use, options);
  example.code.set({ html: htmlSnippet(resolved, content[use]), js: jsSnippet(use, name, options), react: reactSnippet(use, name, options, content[use]) });
}

async function choose(use, module) {
  const example = examples[use];
  example.module = module;
  for (const chip of $$('button', $(`[data-picker="${use}"]`))) chip.setAttribute('aria-pressed', String(chip.dataset.design === module.ornament.name));
  const badge = element('span', { class: 'loading', text: 'Loading artwork…' });
  const timer = setTimeout(() => example.stage.append(badge), 150);
  try { await loadImage(module.resolveOrnament(use, withHosting(example.options())).asset.url); } catch {}
  clearTimeout(timer); badge.remove();
  if (example.module === module) render(use);
}

$('#thickness').addEventListener('input', event => {
  $('#thicknessOut').value = event.target.value + 'px';
  render('frame');
});

for (const button of $$('[data-copy-text]')) button.addEventListener('click', () => copyText(button.dataset.copyText, button));

// Install section: exact versions from the generated release pins.
for (const node of $$('[data-version]')) node.textContent = version;
$('#zipLink').href = `https://github.com/adrian729/medieval-ornaments/releases/download/v${version}/medieval-ornaments-browser.zip`;
$('#packages').append(...Object.values(assetSources).sort((a, b) => a.id.localeCompare(b.id)).map(source => element('li', {},
  element('a', { href: `https://www.npmjs.com/package/${source.package}/v/${source.version}`, text: `${source.package.replace('@ranx729/medieval-ornaments-assets-', '')}@${source.version}` }))));

// Collection counts come from the shared catalog chunk, fetched when idle so
// the first paint stays light; the gallery reuses the cached chunk.
idle(() => import('../lib/catalog.js').then(({ ornaments }) => {
  for (const node of $$('[data-count]')) node.textContent = ornaments.filter(item => item.asset_type === node.dataset.count).length;
}));
document.body.dataset.ready = 'true';
