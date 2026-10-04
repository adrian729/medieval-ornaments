import { ornament } from '../design-data/funny-faced-lying-cat.js';
import { createDesignResolver } from '../bind-design.js';
import { attachOrnament } from '../vanilla-core.js';
export { ornament };
export const resolveOrnament = /* @__PURE__ */ createDesignResolver(ornament, {});
export const createOrnamentImage = (element, options = {}) => attachOrnament(element, 'image', options, resolveOrnament);
