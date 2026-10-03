import { ornament } from '../design-data/plate-18-fan-palmettes.js';
import { createDesignResolver } from '../bind-design.js';
import { attachOrnament } from '../vanilla-core.js';
export { ornament };
export const resolveOrnament = /* @__PURE__ */ createDesignResolver(ornament, {});
export const createFrame = (element, options = {}) => attachOrnament(element, 'frame', options, resolveOrnament);
export const createDivider = (element, options = {}) => attachOrnament(element, 'divider', options, resolveOrnament);
