'use client';
import { createElement, forwardRef } from 'react';
import { resolveOrnament } from './resolve.js';

const sharedKeys = ['design', 'size', 'format', 'pixelRatio', 'assetsBase'];
function render(use, tag, props, ref) {
  const options = {}, html = { ...props };
  const keys = [...sharedKeys, ...(use === 'divider' ? ['orientation', 'length'] : use === 'image' ? ['alt'] : [])];
  for (const key of keys) {
    if (Object.hasOwn(html, key)) options[key] = html[key];
    delete html[key];
  }
  // Catch misplaced library props rather than leaking them onto the DOM.
  for (const key of ['orientation', 'length', 'alt']) {
    if (key in html) throw new TypeError(`${key} is not supported by Ornament${use[0].toUpperCase() + use.slice(1)}.`);
  }
  if (use !== 'frame' && html.children != null) throw new TypeError('Only OrnamentFrame accepts children.');
  if (html.dangerouslySetInnerHTML != null) throw new TypeError('Use ordinary children inside OrnamentFrame.');
  if (use === 'image' && ['src', 'srcSet', 'sizes', 'width', 'height'].some(key => key in html)) throw new TypeError('OrnamentImage selects its source and proportions; use design and size.');
  const configuration = resolveOrnament(use, options);
  const className = [configuration.className, html.className].filter(Boolean).join(' ');
  const style = { ...html.style, ...configuration.style };
  const attributes = { ...configuration.attributes };
  if (use === 'divider' && html['aria-hidden'] !== undefined) attributes['aria-hidden'] = html['aria-hidden'];
  return createElement(tag, { ...html, ...attributes, className, style, ref });
}

export const OrnamentFrame = forwardRef((props, ref) => render('frame', 'div', props, ref));
export const OrnamentDivider = forwardRef((props, ref) => render('divider', 'div', props, ref));
export const OrnamentImage = forwardRef((props, ref) => render('image', 'img', props, ref));
OrnamentFrame.displayName = 'OrnamentFrame';
OrnamentDivider.displayName = 'OrnamentDivider';
OrnamentImage.displayName = 'OrnamentImage';
