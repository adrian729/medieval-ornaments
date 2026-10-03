import { getOrnament } from './selection.js';
import { resolveWithDesign } from './resolve-core.js';
export { getOrnament, findOrnaments } from './selection.js';

export const resolveOrnament = (use, options) => resolveWithDesign(use, options, getOrnament);
