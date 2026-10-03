import { resolveOrnament } from './resolve.js';
import { attachOrnament } from './vanilla-core.js';

export const createFrame = (element, options) => attachOrnament(element, 'frame', options, resolveOrnament);
export const createDivider = (element, options) => attachOrnament(element, 'divider', options, resolveOrnament);
export const createOrnamentImage = (element, options) => attachOrnament(element, 'image', options, resolveOrnament);
