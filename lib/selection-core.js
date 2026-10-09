// Discovery only. This helper imports no catalog, artwork or rendering code.
export function createSelection(ornaments) {
  const byName = new Map(ornaments.map(item => [item.name, item]));
  const search = new Map(ornaments.map(item => [item, [item.name, item.description,
    item.asset_type, item.facing, item.composition, ...item.categories,
    ...item.subjects, ...item.colors, ...item.usage_notes,
    item.author || '', ...Object.values(item.provenance || {})].join(' ').toLowerCase()]));
  function getOrnament(name) {
    const item = byName.get(name);
    if (!item) throw new RangeError(`Unknown ornament design: ${String(name)}. Use findOrnaments() to select a design.`);
    return item;
  }
  function findOrnaments({ use, assetType, hasTransparency, facing, composition, categories = [], subjects = [], colors = [], query = '' } = {}) {
    if (use !== undefined && !['frame', 'divider', 'image'].includes(use)) throw new RangeError('use must be frame, divider, or image.');
    if (assetType !== undefined && !['border', 'decoration', 'illustration'].includes(assetType)) throw new RangeError('assetType must be border, decoration, or illustration.');
    if (hasTransparency !== undefined && typeof hasTransparency !== 'boolean') throw new TypeError('hasTransparency must be a boolean.');
    if (facing !== undefined && !['left', 'right', 'front', 'mixed', 'unclear'].includes(facing)) throw new RangeError('Invalid facing filter.');
    if (composition !== undefined && !['single-ornament', 'standalone', 'repeat-tile', 'single-figure', 'multiple-figures', 'framed-scene'].includes(composition)) throw new RangeError('Invalid composition filter.');
    for (const values of [categories, subjects, colors]) {
      if (!Array.isArray(values) || values.some(value => typeof value !== 'string')) throw new TypeError('Selection filters must be arrays of strings.');
    }
    if (typeof query !== 'string') throw new TypeError('query must be a string.');
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return ornaments.filter(item => (!use || item.uses.includes(use))
      && (!assetType || item.asset_type === assetType)
      && (hasTransparency === undefined || item.has_transparency === hasTransparency)
      && (!facing || item.facing === facing) && (!composition || item.composition === composition)
      && categories.every(value => item.categories.includes(value))
      && subjects.every(value => item.subjects.includes(value))
      && colors.every(value => item.colors.includes(value))
      && tokens.every(token => search.get(item).includes(token)));
  }
  return { getOrnament, findOrnaments };
}
