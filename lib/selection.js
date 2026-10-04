import { ornaments } from './catalog.js';
import { createSelection } from './selection-core.js';
export { ornaments };
export const { getOrnament, findOrnaments } = /* @__PURE__ */ createSelection(ornaments);
