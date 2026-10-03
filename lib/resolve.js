import { ornaments, defaultAssetsBase } from './catalog.js';

const byName = new Map(ornaments.map(item => [item.name, item]));
const defaults = { frame: 32, divider: 24, image: 256 };
const optionKeys = {
  frame: new Set(['design', 'size', 'format', 'pixelRatio', 'assetsBase']),
  divider: new Set(['design', 'size', 'format', 'pixelRatio', 'assetsBase', 'orientation', 'length']),
  image: new Set(['design', 'size', 'format', 'pixelRatio', 'assetsBase', 'alt'])
};

export function getOrnament(name) {
  const item = byName.get(name);
  if (!item) throw new RangeError(`Unknown ornament design: ${String(name)}. Use findOrnaments() to select a design.`);
  return item;
}

export function findOrnaments({ use, categories = [], subjects = [], colors = [], query = '' } = {}) {
  if (use !== undefined && !Object.hasOwn(defaults, use)) throw new RangeError('use must be frame, divider, or image.');
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

function positive(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be a finite positive number.`);
  return value;
}

function lengthValue(value) {
  if (typeof value === 'number') return `${positive(value, 'length')}px`;
  // A deliberately shared browser/server grammar, without browser globals.
  // For container-relative layouts use %, vw/vh, or a supported CSS length.
  if (typeof value !== 'string' || !/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|%|em|rem|vw|vh|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh|ch|ex|cm|mm|in|pt|pc)$/.test(value) || parseFloat(value) <= 0) {
    throw new RangeError('length must be a positive pixel number or CSS length such as "100%", "240px", or "20rem".');
  }
  return value;
}

function imageUrl(path, base) {
  if (typeof base !== 'string' || !base || /[\s?#\\]/.test(base)) throw new TypeError('assetsBase must be an absolute http(s) URL or a root-relative public path without a query or fragment.');
  if (/^https?:\/\//.test(base)) {
    const parsed = new URL(base);
    if (parsed.username || parsed.password) throw new TypeError('assetsBase must not contain credentials.');
  } else if (!base.startsWith('/') || base.startsWith('//')) {
    throw new TypeError('assetsBase must be an absolute http(s) URL or a root-relative public path, such as "/ornaments/".');
  }
  return base.replace(/\/+$/, '') + '/' + path;
}

// Pure and deterministic: used by React, vanilla, SSR and advanced integrations.
// Does not access the DOM, perform requests, or mutate the catalog/options.
export function resolveOrnament(use, options) {
  if (!Object.hasOwn(defaults, use)) throw new RangeError('use must be frame, divider, or image.');
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('An options object with a design is required.');
  for (const key of Object.keys(options)) {
    if (!optionKeys[use].has(key)) throw new TypeError(`Unsupported ${use} option: ${key}.`);
  }
  const item = getOrnament(options.design);
  if (!item.uses.includes(use)) throw new RangeError(`${item.name} cannot be used as ${use}; supported uses: ${item.uses.join(', ')}.`);
  const size = positive(options.size === undefined ? defaults[use] : options.size, 'size');
  const density = positive(options.pixelRatio === undefined ? 2 : options.pixelRatio, 'pixelRatio');
  let axis, source = item;
  if (use === 'frame') source = item.components.border_image;
  if (use === 'divider') {
    const orientation = options.orientation === undefined ? 'original' : options.orientation;
    if (!['original', 'horizontal', 'vertical'].includes(orientation)) throw new RangeError('orientation must be original, horizontal, or vertical.');
    axis = orientation === 'original' ? item.repeat_axis : orientation === 'horizontal' ? 'x' : 'y';
    if (axis !== item.repeat_axis) source = item.components.rotated_tile;
  }
  let format = options.format === undefined ? 'auto' : options.format;
  if (format === 'auto') format = item.derivation === 'vector-reconstruction' && source.svg ? 'svg' : 'webp';
  if (!['svg', 'png', 'webp'].includes(format) || !source[format]) throw new RangeError(`${item.name} does not support format ${String(format)} for ${use}. Available: ${item.formats.join(', ')}.`);
  let selected = source, required;
  if (use === 'frame') required = size * 100 / item.border_image_slice_percent * density;
  else if (use === 'divider') required = size * Math.max(1, item.repeat_ratio) * density;
  else required = size * Math.max(1, source.width / source.height) * density;
  if (!Number.isFinite(required)) throw new RangeError('size and pixelRatio produce an invalid resolution.');
  if (format !== 'svg') {
    const candidates = [...source.variants, source].sort((a, b) => Math.max(a.width, a.height) - Math.max(b.width, b.height));
    selected = candidates.find(asset => Math.max(asset.width, asset.height) + 1e-8 >= required) ?? source;
  }
  const path = selected[format];
  const url = imageUrl(path, options.assetsBase === undefined ? defaultAssetsBase : options.assetsBase);
  const style = { '--ornament-size': `${size}px` };
  const attributes = {};
  if (use === 'image') {
    if (options.alt !== undefined && typeof options.alt !== 'string') throw new TypeError('alt must be a string.');
    attributes.src = url;
    attributes.alt = options.alt ?? '';
  } else {
    style['--ornament-image'] = `url(${JSON.stringify(url)})`;
    if (use === 'frame') style['--ornament-slice'] = `${item.border_image_slice_percent}%`;
    else {
      style['--ornament-ratio'] = String(item.repeat_ratio);
      style['--ornament-length'] = lengthValue(options.length === undefined ? (axis === 'x' ? '100%' : 256) : options.length);
      attributes['data-axis'] = axis;
      attributes['aria-hidden'] = 'true';
    }
  }
  return {
    design: item.name, use, axis, size,
    className: use === 'image' ? 'ornament-image' : `ornament-${use}`,
    style, attributes,
    asset: {
      path, url, format,
      width: format === 'svg' ? source.viewbox[2] : selected.width,
      height: format === 'svg' ? source.viewbox[3] : selected.height,
      resolutionLimited: format !== 'svg' && Math.max(selected.width, selected.height) + 1e-8 < required
    }
  };
}
