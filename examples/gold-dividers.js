// Four independent assets; the flexible rules come from gold-dividers.css.
// In a consumer project use the corresponding @ranx729/medieval-ornaments/designs/* imports.
import { ornament as cinquefoilEnd } from '../lib/designs/gold-cinquefoil-divider-end.js';
import { ornament as cinquefoilCenter } from '../lib/designs/gold-cinquefoil-divider-center.js';
import { ornament as lozengeEnd } from '../lib/designs/gold-lozenge-divider-end.js';
import { ornament as lozengeCenter } from '../lib/designs/gold-lozenge-divider-center.js';
import { assetUrl } from './assets.js';

for (const element of document.querySelectorAll('.manuscript-divider')) {
  for (const [key, item] of Object.entries({ 'cinquefoil-end': cinquefoilEnd, 'cinquefoil-center': cinquefoilCenter,
    'lozenge-end': lozengeEnd, 'lozenge-center': lozengeCenter })) {
    // At these fixed display sizes 256px accommodates the crop and high-density screens.
    const path = item.variants.find(variant => variant.max_dimension === 256).webp;
    element.style.setProperty('--'+key, `url("${assetUrl(path)}")`);
  }
}
