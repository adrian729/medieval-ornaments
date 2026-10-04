import { base } from '../asset-sources/borders-001.js';
import { ornament } from '../design-data/plate-34-nested-fans.js';
import { createDesignResolver } from '../bind-design.js';
import { attachOrnament } from '../vanilla-core.js';
export { ornament };
export const resolveOrnament = /* @__PURE__ */ createDesignResolver(ornament, {}, base);
export const createFrame = (element, options = {}) => attachOrnament(element, 'frame', options, resolveOrnament);
export const createDivider = (element, options = {}) => attachOrnament(element, 'divider', options, resolveOrnament);
