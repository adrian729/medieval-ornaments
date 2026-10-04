import { getOrnament } from './selection.js';
import { resolveWithDesign } from './resolve-core.js';
import { getAssetSource } from './asset-routing.js';
export { getAssetSource } from './asset-routing.js';
export { getOrnament, findOrnaments } from './selection.js';

export const resolveOrnament = (use, options) => resolveWithDesign(use, options, getOrnament, item => getAssetSource(item.name).base);
