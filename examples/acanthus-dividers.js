// Individual metadata imports keep this composition independent of full catalogs.
import { resolveOrnament as start } from '../lib/designs/illuminated-acanthus-divider-start.js';
import { resolveOrnament as center } from '../lib/designs/illuminated-acanthus-divider-center.js';
import { resolveOrnament as end } from '../lib/designs/illuminated-acanthus-divider-end.js';
import { resolveOrnament as fleuron } from '../lib/designs/illuminated-acanthus-section-fleuron.js';
import { resolveOrnament as sprig } from '../lib/designs/illuminated-acanthus-leaf-sprig.js';
import { resolveOrnament as rosette } from '../lib/designs/illuminated-acanthus-rosette.js';
import { resolveOrnament as horizontal } from '../lib/designs/illuminated-acanthus-horizontal-flourish.js';
import { resolveOrnament as vertical } from '../lib/designs/illuminated-acanthus-vertical-sprig.js';
import { assetsBase } from './shared/env.js';

const hosting = assetsBase ? { assetsBase } : {};
function paint(element, resolve) {
  // Set native proportions before measuring the CSS width. The resolver selects
  // a suitable variant for the resulting height and actual screen density.
  const initial = resolve('image', { ...hosting, size: 1 });
  element.width = Number(initial.attributes.width);
  element.height = Number(initial.attributes.height);
  const update = () => {
    const size = element.getBoundingClientRect().width * element.height / element.width;
    if (!size) return;
    const { attributes } = resolve('image', { ...hosting, size, pixelRatio: window.devicePixelRatio || 1, alt: '', decoding: 'async' });
    for (const [key, value] of Object.entries(attributes)) {
      if (element.getAttribute(key) !== value) element.setAttribute(key, value);
    }
  };
  update();
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
  }
}
for (const element of document.querySelectorAll('.acanthus-divider')) {
  for (const [part, resolve] of [['start', start], ['center', center], ['end', end]]) {
    paint(element.querySelector('.' + part), resolve);
  }
}
for (const [part, resolve] of [['fleuron', fleuron], ['sprig', sprig], ['rosette', rosette], ['horizontal', horizontal], ['vertical', vertical]]) {
  for (const element of document.querySelectorAll('.acanthus-accents .' + part)) {
    paint(element, resolve);
  }
}
