'use client';
import { resolveOrnament } from './resolve.js';
import { createOrnamentComponent } from './react-core.js';

export const OrnamentFrame = /* @__PURE__ */ createOrnamentComponent('frame', resolveOrnament);
export const OrnamentDivider = /* @__PURE__ */ createOrnamentComponent('divider', resolveOrnament);
export const OrnamentImage = /* @__PURE__ */ createOrnamentComponent('image', resolveOrnament);
