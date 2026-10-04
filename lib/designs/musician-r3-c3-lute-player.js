import { base } from '../asset-sources/illustrations-001.js';
import { ornament } from '../design-data/musician-r3-c3-lute-player.js';
import { createDesignResolver } from '../bind-design.js';
import { attachOrnament } from '../vanilla-core.js';
export { ornament };
export const resolveOrnament = /* @__PURE__ */ createDesignResolver(ornament, {}, base);
export const createOrnamentImage = (element, options = {}) => attachOrnament(element, 'image', options, resolveOrnament);
