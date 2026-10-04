import { getAssetSource } from '../lib/asset-routing.js';
export function staticAssets(html, localBase) {
  return html.replace(/(?:\.\.\/|https:\/\/unpkg\.com\/@ranx729\/medieval-ornaments-assets(?:-[a-z0-9-]+)?@\d+\.\d+\.\d+\/|(?<=url\(['"]))((?:svg|png|webp)\/[a-z0-9/-]+\.(?:svg|png|webp))/g, (match, relative) => {
    if (localBase) return localBase + relative;
    const stem=relative.split('/').at(-1).replace(/\.[^.]+$/, '');
    for(const name of [stem,stem.replace(/-(border|corner|rotated|reference)$/, '')]) {
      try{return getAssetSource(name).base+relative;}catch(error){if(!(error instanceof RangeError))throw error;}
    }
    throw Error('Unassigned static demo resource: '+relative);
  });
}
