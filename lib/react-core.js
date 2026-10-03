'use client';
import { createElement, forwardRef, useCallback, useEffect, useRef, useState, version as reactVersion } from 'react';
import { observeNearViewport } from './visibility.js';

const sharedKeys = ['design', 'size', 'format', 'pixelRatio', 'assetsBase', 'loading'];
function render(use, tag, props, ref, resolve) {
  const options = {}, html = { ...props };
  const keys = [...sharedKeys, ...(use === 'divider' ? ['orientation', 'length'] : use === 'image' ? ['alt', 'decoding', 'fetchPriority'] : [])];
  for (const key of keys) {
    if (Object.hasOwn(html, key)) options[key] = html[key];
    delete html[key];
  }
  // Catch misplaced library props rather than leaking them onto the DOM.
  for (const key of ['orientation', 'length', 'alt', 'decoding', 'fetchPriority']) {
    if (key in html) throw new TypeError(`${key} is not supported by Ornament${use[0].toUpperCase() + use.slice(1)}.`);
  }
  if (use !== 'frame' && html.children != null) throw new TypeError('Only OrnamentFrame accepts children.');
  if (html.dangerouslySetInnerHTML != null) throw new TypeError('Use ordinary children inside OrnamentFrame.');
  if (use === 'image' && ['src', 'srcSet', 'sizes', 'width', 'height'].some(key => key in html)) throw new TypeError('OrnamentImage selects its source and proportions; use design and size.');
  const configuration = resolve(use, options);
  const element = useRef(null);
  const [loaded, setLoaded] = useState(configuration.loading !== 'lazy' || use === 'image');
  const deferred = use !== 'image' && configuration.loading === 'lazy' && !loaded;
  useEffect(() => {
    if (use === 'image' || loaded) return;
    if (configuration.loading === 'eager') { setLoaded(true); return; }
    return observeNearViewport(element.current, () => setLoaded(true));
  }, [use, configuration.loading, loaded]);
  const attachRef = useCallback(node => {
    element.current = node;
    if (typeof ref === 'function') {
      const cleanup = ref(node);
      if (typeof cleanup === 'function') return () => { element.current = null; cleanup(); };
    } else if (ref) ref.current = node;
  }, [ref]);
  const className = [configuration.className, html.className].filter(Boolean).join(' ');
  const style = { ...html.style, ...configuration.style };
  if (deferred) style['--ornament-image'] = 'none';
  const attributes = { ...configuration.attributes };
  // React 18 forwards unknown lowercase attributes; React 19 knows this prop.
  if (use === 'image' && !reactVersion.startsWith('18.')) {
    attributes.fetchPriority = attributes.fetchpriority; delete attributes.fetchpriority;
  }
  if (use === 'divider' && html['aria-hidden'] !== undefined) attributes['aria-hidden'] = html['aria-hidden'];
  return createElement(tag, { ...html, ...attributes, className, style, ref: attachRef });
}

export function createOrnamentComponent(use, resolve) {
  const component = forwardRef((props, ref) => render(use, use === 'image' ? 'img' : 'div', props, ref, resolve));
  component.displayName = `Ornament${use[0].toUpperCase() + use.slice(1)}`;
  return component;
}
