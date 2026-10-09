// Artwork hosting for the example pages. Published pages use the library's
// default CDN routing, exactly like any other project. The offline ZIP sets
// data-assets-base to its bundled mirror, and ?assets=local previews
// unpublished artwork through a checkout's linked resource files.
const declared = document.documentElement.dataset.assetsBase;
// A variable, not a literal: bundlers rewrite new URL('literal', import.meta.url) as an asset import.
const checkoutRoot = '../../';
export const assetsBase = declared ? new URL(declared, location.href).href
  : new URLSearchParams(location.search).get('assets') === 'local' ? new URL(checkoutRoot, import.meta.url).href
  : undefined;
export const withHosting = options => assetsBase ? { ...options, assetsBase } : options;
