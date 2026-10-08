'use client';
import { base } from '../asset-sources/illustrations-001.js';
import { ornament } from '../design-data/walters-rabbit-church-bells.js';
import { createDesignResolver } from '../bind-design.js';
import { createOrnamentComponent } from '../react-core.js';
export { ornament };
const resolve = /* @__PURE__ */ createDesignResolver(ornament, {}, base);
export const OrnamentImage = /* @__PURE__ */ createOrnamentComponent('image', resolve);
