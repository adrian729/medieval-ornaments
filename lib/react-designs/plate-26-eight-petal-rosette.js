'use client';
import { ornament } from '../design-data/plate-26-eight-petal-rosette.js';
import { createDesignResolver } from '../bind-design.js';
import { createOrnamentComponent } from '../react-core.js';
export { ornament };
const resolve = /* @__PURE__ */ createDesignResolver(ornament, {});
export const OrnamentFrame = /* @__PURE__ */ createOrnamentComponent('frame', resolve);
export const OrnamentDivider = /* @__PURE__ */ createOrnamentComponent('divider', resolve);
