import { ornament } from '../design-data/gold-scroll-with-blue-bellflowers.js';
import { createDesignResolver } from '../bind-design.js';
import { attachOrnament } from '../vanilla-core.js';
export { ornament };
export const resolveOrnament = /* @__PURE__ */ createDesignResolver(ornament, {});
export const createOrnamentImage = (element, options = {}) => attachOrnament(element, 'image', options, resolveOrnament);
