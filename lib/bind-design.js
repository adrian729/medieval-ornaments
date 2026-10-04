import { resolveWithDesign } from './resolve-core.js';

export function createDesignResolver(ornament, defaults = {}, defaultBase) {
  const select = name => {
    if (name !== undefined && name !== ornament.name) throw new RangeError(`This import supports only ${ornament.name}; received ${String(name)}.`);
    return ornament;
  };
  return (use, options = {}) => {
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('An options object is required.');
    const merged = { ...defaults, ...options };
    for (const key of Object.keys(defaults)) if (options[key] === undefined) merged[key] = defaults[key];
    return resolveWithDesign(use, merged, select, defaultBase);
  };
}
