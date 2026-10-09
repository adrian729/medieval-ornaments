// Four independent assets; the continuous rule comes from gold-dividers.css.
// In a consumer project use the corresponding @ranx729/medieval-ornaments/designs/* imports.
import { resolveOrnament as cinquefoilEnd } from '../lib/designs/gold-cinquefoil-divider-end.js';
import { resolveOrnament as cinquefoilCenter } from '../lib/designs/gold-cinquefoil-divider-center.js';
import { resolveOrnament as lozengeEnd } from '../lib/designs/gold-lozenge-divider-end.js';
import { resolveOrnament as lozengeCenter } from '../lib/designs/gold-lozenge-divider-center.js';
import { assetUrl } from './assets.js';

for (const element of document.querySelectorAll('.manuscript-divider')) {
  const variant = element.classList.contains('cinquefoil') ? 'cinquefoil' : 'lozenge';
  const resolvers = { 'cinquefoil-end': cinquefoilEnd, 'cinquefoil-center': cinquefoilCenter,
    'lozenge-end': lozengeEnd, 'lozenge-center': lozengeCenter };
  for (const [part, selector] of [['end', '.terminal'], ['center', '.centre']]) {
    const style = getComputedStyle(element.querySelector(selector));
    // Account for the cropped background's full canvas before selecting resolution.
    const size = parseFloat(style.height) * parseFloat(style.backgroundSize.split(' ')[1]) / 100;
    const { asset } = resolvers[variant+'-'+part]('image', { size, pixelRatio: devicePixelRatio || 1 });
    element.style.setProperty('--'+variant+'-'+part, `url("${assetUrl(asset.path)}")`);
  }
}
