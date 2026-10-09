// Artwork hosting for the example pages. Published pages use the library's
// default CDN routing, exactly like any other project. The offline ZIP sets
// data-assets-base to its bundled mirror, and ?assets=local previews
// unpublished artwork through a checkout's linked resource files.
const declared = document.documentElement.dataset.assetsBase;
export const assetsBase = declared ? new URL(declared, location.href).href
  : new URLSearchParams(location.search).get('assets') === 'local' ? new URL('../../', import.meta.url).href
  : undefined;
export const withHosting = options => assetsBase ? { ...options, assetsBase } : options;
