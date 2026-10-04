import { base } from '../asset-sources/decorations-001.js';
import { ornament } from '../design-data/painted-symmetric-leaf-and-flower-panel.js';
import { createDesignResolver } from '../bind-design.js';
import { attachOrnament } from '../vanilla-core.js';
export { ornament };
export const resolveOrnament = /* @__PURE__ */ createDesignResolver(ornament, {}, base);
export const createOrnamentImage = (element, options = {}) => attachOrnament(element, 'image', options, resolveOrnament);
