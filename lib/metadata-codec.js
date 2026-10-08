// Compact private serialization; public metadata keeps all original fields.
// The shared dictionary contains field names only, never other designs.
const keys = 'artist asset_type audit border_image border_image_slice_percent categories clip_regions colors components composition corner corner_method date derivation description facing formats frame_edge_ratio frame_fit has_transparency height image_rights image_url institution kind master_longest_dimension_cap max_dimension method name object_identifier png png_bytes provenance record_url reference reference_crop reference_design rendered_max_dimension repeat_axis repeat_ratio rights_url rotated_tile slice_pixels source_bounds source_canvas source_pattern source_sha256 subjects svg title usage_notes uses variants viewbox webp webp_bytes width'.split(' ');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const folders = ['', '128/', '256/', '512/', '768/'];
const suffixes = ['', '-border', '-corner', '-rotated', '-reference'];

export function encodeMetadata(value, name = value?.name) {
  if (Array.isArray(value)) return [0, ...value.map(item => encodeMetadata(item, name))];
  if (typeof value === 'string' && name) {
    const match = /^(png|webp|svg)\/(128\/|256\/|512\/|768\/)?([^/]+)\.(png|webp|svg)$/.exec(value);
    if (match && match[1] === match[4]) {
      const suffix = suffixes.indexOf(match[3].slice(name.length));
      if (match[3].startsWith(name) && suffix !== -1) return [2, ['png', 'webp', 'svg'].indexOf(match[1])*5 + folders.indexOf(match[2] || ''), suffix];
    }
  }
  if (!value || typeof value !== 'object') return value;
  const entries = Object.entries(value);
  const indices = entries.map(([key]) => keys.indexOf(key));
  // Preserve future/custom fields without changing the dictionary contract.
  if (indices.includes(-1)) return ['', ...entries.flatMap(([key, item]) => [key, encodeMetadata(item, name)])];
  return [indices.map(index => alphabet[index]).join(''), ...entries.map(([, item]) => encodeMetadata(item, name))];
}

export function decodeMetadata(value, name) {
  if (!Array.isArray(value)) return value;
  const [signature, ...items] = value;
  if (signature === 0) return items.map(item => decodeMetadata(item, name));
  if (signature === 2) {
    const format = ['png', 'webp', 'svg'][Math.floor(items[0]/5)];
    return format+'/'+folders[items[0]%5]+name+suffixes[items[1]]+'.'+format;
  }
  if (name === undefined) {
    const index = signature === '' ? items.findIndex((item, i) => i % 2 === 0 && item === 'name') : signature.indexOf(alphabet[keys.indexOf('name')]);
    if (index !== -1) name = items[signature === '' ? index+1 : index];
  }
  if (signature === '') return Object.fromEntries(items.reduce((entries, item, i) => {
    if (i % 2 === 0) entries.push([item, decodeMetadata(items[i+1], name)]);
    return entries;
  }, []));
  return Object.fromEntries([...signature].map((code, i) => [keys[alphabet.indexOf(code)], decodeMetadata(items[i], name)]));
}
