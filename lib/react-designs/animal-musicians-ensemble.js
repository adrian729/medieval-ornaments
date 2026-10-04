'use client';
import { ornament } from '../design-data/animal-musicians-ensemble.js';
import { createDesignResolver } from '../bind-design.js';
import { createOrnamentComponent } from '../react-core.js';
export { ornament };
const resolve = /* @__PURE__ */ createDesignResolver(ornament, {});
export const OrnamentImage = /* @__PURE__ */ createOrnamentComponent('image', resolve);
