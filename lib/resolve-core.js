import { defaultAssetsBase } from './runtime.js';

const defaults = { frame: 32, divider: 24, image: 256 };
const optionKeys = {
  frame: new Set(['design', 'size', 'format', 'pixelRatio', 'assetsBase', 'loading']),
  divider: new Set(['design', 'size', 'format', 'pixelRatio', 'assetsBase', 'loading', 'orientation', 'length']),
  image: new Set(['design', 'size', 'format', 'pixelRatio', 'assetsBase', 'loading', 'alt', 'decoding', 'fetchPriority'])
};

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
export function resolveWithDesign(use, options, selectDesign) {
  if (!Object.hasOwn(defaults, use)) throw new RangeError('use must be frame, divider, or image.');
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('An options object with a design is required.');
  for (const key of Object.keys(options)) {
    if (!optionKeys[use].has(key)) throw new TypeError(`Unsupported ${use} option: ${key}.`);
  }
  const item = selectDesign(options.design);
  if (!item.uses.includes(use)) throw new RangeError(`${item.name} cannot be used as ${use}; supported uses: ${item.uses.join(', ')}.`);
  const size = positive(options.size === undefined ? defaults[use] : options.size, 'size');
  const density = positive(options.pixelRatio === undefined ? 2 : options.pixelRatio, 'pixelRatio');
  const loading = options.loading === undefined ? 'eager' : options.loading;
  if (!['eager', 'lazy'].includes(loading)) throw new RangeError('loading must be eager or lazy.');
  let axis, source = item;
  if (use === 'frame') source = item.components.border_image;
  if (use === 'divider') {
    const orientation = options.orientation === undefined ? 'original' : options.orientation;
    if (!['original', 'horizontal', 'vertical'].includes(orientation)) throw new RangeError('orientation must be original, horizontal, or vertical.');
    axis = orientation === 'original' ? item.repeat_axis : orientation === 'horizontal' ? 'x' : 'y';
    if (axis !== item.repeat_axis) source = item.components.rotated_tile;
  }
  let format = options.format === undefined ? 'auto' : options.format;
  if (format === 'auto') format = item.derivation === 'vector-reconstruction' && source.svg && item.formats.includes('svg') ? 'svg' : source.webp && item.formats.includes('webp') ? 'webp' : source.png && item.formats.includes('png') ? 'png' : 'svg';
  if (!['svg', 'png', 'webp'].includes(format) || !item.formats.includes(format) || !source[format]) throw new RangeError(`${item.name} does not support format ${String(format)} for ${use}. Available: ${item.formats.join(', ')}.`);
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
    const decoding = options.decoding === undefined ? 'auto' : options.decoding;
    const priority = options.fetchPriority === undefined ? 'auto' : options.fetchPriority;
    if (!['auto', 'sync', 'async'].includes(decoding)) throw new RangeError('decoding must be auto, sync, or async.');
    if (!['auto', 'high', 'low'].includes(priority)) throw new RangeError('fetchPriority must be auto, high, or low.');
    // Reserve the source proportions before decoding, also for lazy images.
    attributes.width = String(source.width); attributes.height = String(source.height);
    attributes.loading = loading; attributes.decoding = decoding;
    attributes.fetchpriority = priority;
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
    design: item.name, use, axis, size, loading,
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
