// Discovery only. This helper imports no catalog, artwork or rendering code.
// Query words match the start of words, ignoring case and punctuation, so
// "red" finds "red" and "reddish" but not "covered", accents are optional, and
// design names match whether typed with hyphens or spaces.
const words = text => ' ' + String(text).toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
// Results rank by where each word matched: name, then tags, description,
// and finally usage notes and provenance. Ties keep catalog order.
const WEIGHTS = [8, 4, 2, 1];
// Descriptive provenance only; hashes, URLs, rights notices and audit files are not search terms.
const PROVENANCE = ['artist', 'title', 'institution', 'date'];
export function createSelection(ornaments) {
  const byName = new Map(ornaments.map(item => [item.name, item]));
  const search = new Map(ornaments.map(item => [item, [[item.name],
    [item.asset_type, item.facing, item.composition, ...item.categories, ...item.subjects, ...item.colors,
      item.author || '', ...(item.sets || []).flatMap(set => [set.id, set.name])],
    [item.description], [...item.usage_notes, ...PROVENANCE.map(key => item.provenance?.[key] || '')]]
    .map(fields => fields.map(words).join(''))]));
  function score(item, tokens) {
    let total = 0;
    for (const token of tokens) {
      const field = search.get(item).findIndex(text => text.includes(token));
      if (field < 0) return 0;
      total += WEIGHTS[field];
    }
    return total;
  }
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
    const tokens = words(query).split(' ').filter(Boolean).map(token => ' ' + token);
    const matches = ornaments.filter(item => (!use || item.uses.includes(use))
      && (!assetType || item.asset_type === assetType)
      && (hasTransparency === undefined || item.has_transparency === hasTransparency)
      && (!facing || item.facing === facing) && (!composition || item.composition === composition)
      && categories.every(value => item.categories.includes(value))
      && subjects.every(value => item.subjects.includes(value))
      && colors.every(value => item.colors.includes(value)));
    if (!tokens.length) return matches;
    const scores = new Map(matches.map(item => [item, score(item, tokens)]));
    return matches.filter(item => scores.get(item)).sort((a, b) => scores.get(b) - scores.get(a));
  }
  return { getOrnament, findOrnaments };
}
