import { observeNearViewport } from './visibility.js';

const attached = new WeakMap();

export function attachOrnament(element, use, initial, resolve) {
  if (!element || element.nodeType !== 1 || element.namespaceURI !== 'http://www.w3.org/1999/xhtml' || !element.style || !element.classList) throw new TypeError('An HTML element is required.');
  if (use === 'image' && element.tagName !== 'IMG') throw new TypeError('createOrnamentImage requires an img element.');
  if (use !== 'image' && ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR', 'CANVAS', 'IFRAME', 'VIDEO', 'AUDIO'].includes(element.tagName)) throw new TypeError(`${use} requires a container element such as div or article.`);
  if (attached.has(element)) throw new Error('This element already has an ornament controller. Destroy it before attaching another.');
  let options = { ...initial }, current = resolve(use, initial), destroyed = false;
  let loaded = use === 'image' || current.loading !== 'lazy', cancel = () => {}, paintedStyle;
  const previousClass = element.classList.contains(current.className);
  const styles = new Map(Object.keys(current.style).map(key => [key, { value: element.style.getPropertyValue(key), priority: element.style.getPropertyPriority(key) }]));
  const attributes = new Map(Object.keys(current.attributes).map(key => [key, element.getAttribute(key)]));
  function paint(result) {
    if (!element.classList.contains(result.className)) element.classList.add(result.className);
    paintedStyle = { ...result.style };
    if (!loaded) paintedStyle['--ornament-image'] = 'none';
    for (const [key, value] of Object.entries(paintedStyle)) {
      if (element.style.getPropertyValue(key) !== value) element.style.setProperty(key, value);
    }
    for (const [key, value] of Object.entries(result.attributes)) {
      if (element.getAttribute(key) !== value) element.setAttribute(key, value);
    }
  }
  const controller = {
    element,
    get configuration() { return resolve(use, options); },
    update(patch) {
      if (destroyed) throw new Error('Cannot update a destroyed ornament controller.');
      if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new TypeError('update requires a partial options object.');
      const nextOptions = { ...options, ...patch };
      const next = resolve(use, nextOptions); // Validate completely before touching the DOM.
      if (next.loading === 'eager' && !loaded) { cancel(); loaded = true; }
      options = nextOptions;
      current = next;
      paint(next);
      return controller;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancel();
      attached.delete(element);
      // Restore only values still owned by this controller; retain external edits.
      if (!previousClass) element.classList.remove(current.className);
      for (const [key, before] of styles) {
        if (element.style.getPropertyValue(key) !== paintedStyle[key]) continue;
        if (before.value) element.style.setProperty(key, before.value, before.priority);
        else element.style.removeProperty(key);
      }
      for (const [key, before] of attributes) {
        if (element.getAttribute(key) !== current.attributes[key]) continue;
        if (before === null) element.removeAttribute(key);
        else element.setAttribute(key, before);
      }
    }
  };
  attached.set(element, controller);
  paint(current);
  if (!loaded) cancel = observeNearViewport(element, () => { if (!destroyed) { loaded = true; paint(current); } });
  return controller;
}

