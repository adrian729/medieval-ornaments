// Small DOM helpers shared by the overview, gallery and integration examples.
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function element(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  node.append(...children.filter(child => child !== undefined && child !== null && child !== false));
  return node;
}

// "plate-27-blue-flower-medallions" → "Plate 27 · Blue flower medallions"
export function readable(name) {
  const plate = /^plate-(\d+)-(.*)$/.exec(name);
  const words = (plate ? plate[2] : name).replaceAll('-', ' ');
  const text = words.charAt(0).toUpperCase() + words.slice(1);
  return plate ? `Plate ${Number(plate[1])} · ${text}` : text;
}
export const typeLabel = { border: 'Border', decoration: 'Decoration', illustration: 'Illustration' };
export const typePlural = { border: 'Borders', decoration: 'Decorations', illustration: 'Illustrations' };

export function debounce(fn, wait = 150) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
}

// Resolves once the image is decoded (or rejects), so callers can swap
// artwork without showing a half-loaded frame.
export function loadImage(url) {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  return image.decode().then(() => image);
}

// Warm the browser and CDN cache without competing with visible images.
const prefetched = new Set();
export function prefetch(url) {
  if (!url || prefetched.has(url)) return;
  prefetched.add(url);
  const image = new Image();
  image.fetchPriority = 'low';
  image.decoding = 'async';
  image.src = url;
}

export const idle = callback => (window.requestIdleCallback || (fn => setTimeout(fn, 200)))(callback);

// Segmented buttons: <div class="segmented"><button data-value="…">…
export function segmented(container, onChange) {
  const buttons = $$('button[data-value]', container);
  const select = value => { for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.value === value)); };
  for (const button of buttons) button.addEventListener('click', () => { select(button.dataset.value); onChange(button.dataset.value); });
  return { select, get value() { return buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.value; } };
}

export async function copyText(text, button) {
  const label = button.textContent;
  try { await navigator.clipboard.writeText(text); button.textContent = 'Copied'; }
  catch { button.textContent = 'Press Ctrl/⌘ C'; }
  setTimeout(() => { button.textContent = label; }, 1800);
}

// Tabbed code panel. Markup: .code-panel > .code-bar > .code-tabs > button[data-lang], .copy; pre.code
export function codePanel(panel) {
  const tabs = $$('.code-tabs button', panel), pre = $('pre.code', panel), copy = $('.copy', panel);
  let snippets = {}, current = tabs[0]?.dataset.lang;
  const show = lang => {
    current = lang;
    for (const tab of tabs) tab.setAttribute('aria-selected', String(tab.dataset.lang === lang));
    pre.textContent = snippets[lang] ?? '';
  };
  for (const tab of tabs) tab.addEventListener('click', () => show(tab.dataset.lang));
  copy?.addEventListener('click', () => copyText(pre.textContent, copy));
  return { set(next) { snippets = next; show(current); }, get text() { return pre.textContent; } };
}
