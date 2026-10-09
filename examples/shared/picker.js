// Searchable design picker for the plain JavaScript example: a trigger button
// showing the current design and a dialog with type, category and text filters.
// Thumbnails are rendered by the caller (with the library) and load lazily.
import { element, readable, debounce, typePlural } from './ui.js';

const capital = text => text[0].toUpperCase() + text.slice(1);

export function createPicker({ id, label, items, value, search, thumbnail, onChange }) {
  const byName = new Map(items.map(item => [item.name, item]));
  const types = [...new Set(items.map(item => item.asset_type))];
  const state = { type: 'all', category: '', query: '' };
  let current = value, cleanups = [];

  const triggerArt = element('span', { class: 'picker-thumb' });
  const triggerName = element('strong');
  const trigger = element('button', { type: 'button', class: 'picker-trigger', id, 'aria-haspopup': 'dialog', 'data-value': value },
    triggerArt, element('span', { class: 'picker-label' }, triggerName, element('small', { text: 'Change' })));

  const search_ = element('input', { type: 'search', name: `${id}-search`, placeholder: 'Search names, subjects, colours…', 'aria-label': `Search ${label.toLowerCase()}`, autocomplete: 'off' });
  const category = element('select', { name: `${id}-category`, 'aria-label': 'Category' });
  const tabs = types.length > 1 ? element('div', { class: 'segmented', role: 'group', 'aria-label': 'Type' },
    ...['all', ...types].map(type => element('button', { type: 'button', 'data-value': type, 'aria-pressed': String(type === 'all'), text: type === 'all' ? 'All' : typePlural[type] }))) : null;
  const count = element('p', { class: 'picker-count', 'aria-live': 'polite' });
  const grid = element('ul', { class: 'picker-grid' });
  const close = element('button', { type: 'button', class: 'btn btn-icon', 'aria-label': 'Close', text: '×' });
  const dialog = element('dialog', { class: 'picker', 'aria-label': `Choose ${label.toLowerCase()}` },
    element('div', { class: 'picker-head' }, element('h2', { text: `Choose ${label.toLowerCase()}` }), close),
    element('div', { class: 'picker-tools' }, tabs, search_, category),
    count, grid);
  document.body.append(dialog);

  function results() {
    const allowed = new Set(search(state.query).map(item => item.name));
    return items.filter(item => allowed.has(item.name) && (state.type === 'all' || item.asset_type === state.type)
      && (!state.category || item.categories.includes(state.category)));
  }
  function renderCategories() {
    const counts = new Map();
    for (const item of items.filter(item => state.type === 'all' || item.asset_type === state.type))
      for (const name of item.categories) counts.set(name, (counts.get(name) || 0) + 1);
    if (state.category && !counts.has(state.category)) state.category = '';
    category.replaceChildren(new Option('All categories', ''), ...[...counts].sort(([a], [b]) => a.localeCompare(b)).map(([name, n]) => new Option(`${capital(name)} (${n})`, name)));
    category.value = state.category;
  }
  function render() {
    for (const cleanup of cleanups) cleanup();
    cleanups = [];
    const list = results();
    count.textContent = list.length ? `${list.length} design${list.length === 1 ? '' : 's'}` : 'No designs match. Try another word or category.';
    grid.replaceChildren(...list.map(item => {
      const art = element('span', { class: 'tile-art' });
      cleanups.push(thumbnail(item, art, { lazy: true }));
      const button = element('button', { type: 'button', class: 'picker-tile', 'data-design': item.name, 'aria-pressed': String(item.name === current) },
        art, element('span', { class: 'tile-name', text: readable(item.name) }));
      button.addEventListener('click', () => { select(item.name); dialog.close(); });
      return element('li', {}, button);
    }));
  }
  let triggerCleanup;
  function select(name) {
    if (!byName.has(name)) return;
    current = name; trigger.dataset.value = name;
    triggerName.textContent = readable(name);
    triggerCleanup?.();
    triggerArt.replaceChildren();
    triggerCleanup = thumbnail(byName.get(name), triggerArt, { lazy: false });
    onChange(name);
  }

  // Each opening starts from the full list; type and category choices persist.
  trigger.addEventListener('click', () => { search_.value = ''; state.query = ''; renderCategories(); render(); dialog.showModal(); search_.focus(); });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  // 'close' fires after a delay; skip it if the picker was already reopened.
  dialog.addEventListener('close', () => { if (dialog.open) return; for (const cleanup of cleanups) cleanup(); cleanups = []; grid.replaceChildren(); });
  search_.addEventListener('input', debounce(() => { state.query = search_.value.trim(); render(); }, 150));
  category.addEventListener('change', () => { state.category = category.value; render(); });
  tabs?.addEventListener('click', event => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    state.type = button.dataset.value;
    for (const tab of tabs.children) tab.setAttribute('aria-pressed', String(tab === button));
    renderCategories(); render();
  });

  triggerName.textContent = readable(value);
  triggerCleanup = thumbnail(byName.get(value), triggerArt, { lazy: false });
  return { element: trigger, get value() { return current; }, select };
}
