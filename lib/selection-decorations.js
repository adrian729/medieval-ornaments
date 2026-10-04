import { ornaments } from './catalog-decorations.js';
import { createSelection } from './selection-core.js';
export { ornaments };
export const { getOrnament, findOrnaments } = /* @__PURE__ */ createSelection(ornaments);
