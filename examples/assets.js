import { getAssetSource } from '../lib/asset-routing.js';

// Public demos use immutable CDN assets. The offline ZIP explicitly opts into
// its flat local mirror; authoring previews can use ?assets=local.
export function assetUrl(relative) {
  const local = document.documentElement.dataset.assetsBase;
  if (local) return new URL(relative, new URL(local, location.href)).href;
  if (new URLSearchParams(location.search).get('assets') === 'local') return new URL('../' + relative, import.meta.url).href;
  if (!/^(?:svg|png|webp)\//.test(relative)) return new URL('../' + relative, import.meta.url).href;
  const stem = relative.split('/').at(-1).replace(/\.(svg|png|webp)$/, '');
  for (const name of [stem, stem.replace(/-(border|corner|rotated|reference)$/, '')]) {
    try { return getAssetSource(name).base + relative; } catch (error) { if (!(error instanceof RangeError)) throw error; }
  }
  throw new RangeError('Unassigned demo resource: ' + relative);
}
