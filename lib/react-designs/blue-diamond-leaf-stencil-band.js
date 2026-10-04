'use client';
import { base } from '../asset-sources/borders-001.js';
import { ornament } from '../design-data/blue-diamond-leaf-stencil-band.js';
import { createDesignResolver } from '../bind-design.js';
import { createOrnamentComponent } from '../react-core.js';
export { ornament };
const resolve = /* @__PURE__ */ createDesignResolver(ornament, {}, base);
export const OrnamentFrame = /* @__PURE__ */ createOrnamentComponent('frame', resolve);
export const OrnamentDivider = /* @__PURE__ */ createOrnamentComponent('divider', resolve);
