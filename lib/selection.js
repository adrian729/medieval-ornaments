import { ornaments } from './catalog.js';
export { ornaments };
const byName = new Map(ornaments.map(item => [item.name, item]));

export function getOrnament(name) {
  const item = byName.get(name);
  if (!item) throw new RangeError(`Unknown ornament design: ${String(name)}. Use findOrnaments() to select a design.`);
  return item;
}

export function findOrnaments({ use, categories = [], subjects = [], colors = [], query = '' } = {}) {
  if (use !== undefined && !['frame', 'divider', 'image'].includes(use)) throw new RangeError('use must be frame, divider, or image.');
  for (const values of [categories, subjects, colors]) {
    if (!Array.isArray(values) || values.some(value => typeof value !== 'string')) throw new TypeError('Selection filters must be arrays of strings.');
  }
  if (typeof query !== 'string') throw new TypeError('query must be a string.');
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return ornaments.filter(item => (!use || item.uses.includes(use))
    && categories.every(value => item.categories.includes(value))
    && subjects.every(value => item.subjects.includes(value))
    && colors.every(value => item.colors.includes(value))
    && tokens.every(token => [item.name, item.description, ...item.categories, ...item.subjects, ...item.colors].join(' ').toLowerCase().includes(token)));
}

