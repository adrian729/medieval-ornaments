'use client';
import { base } from '../asset-sources/decorations-001.js';
import { ornament } from '../design-data/plate-37-diamond-scroll.js';
import { createDesignResolver } from '../bind-design.js';
import { createOrnamentComponent } from '../react-core.js';
export { ornament };
const resolve = /* @__PURE__ */ createDesignResolver(ornament, {}, base);
export const OrnamentImage = /* @__PURE__ */ createOrnamentComponent('image', resolve);
