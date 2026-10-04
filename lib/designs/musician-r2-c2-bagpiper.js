import { ornament } from '../design-data/musician-r2-c2-bagpiper.js';
import { createDesignResolver } from '../bind-design.js';
import { attachOrnament } from '../vanilla-core.js';
export { ornament };
export const resolveOrnament = /* @__PURE__ */ createDesignResolver(ornament, {});
export const createOrnamentImage = (element, options = {}) => attachOrnament(element, 'image', options, resolveOrnament);
