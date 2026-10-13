// Searchable design picker for the plain JavaScript example: a trigger button
// showing the current design and a dialog with type, category and text filters.
// Thumbnails are rendered by the caller (with the library) and load lazily.
import { element, readable, debounce, typePlural } from './ui.js';

const capital = text => text[0].toUpperCase() + text.slice(1);

export function createPicker({ id, label, items, value, search, thumbnail, onChange, load }) {
  let byName = new Map(items.map(item => [item.name, item]));
  const state = { type: 'all', category: '', query: '' };
  let current = value, cleanups = [], limit = 48, loaded = !load;

  const triggerArt = element('span', { class: 'picker-thumb' });
  const triggerName = element('strong');
  const trigger = element('button', { type: 'button', class: 'picker-trigger', id, 'aria-haspopup': 'dialog', 'data-value': value },
    triggerArt, element('span', { class: 'picker-label' }, triggerName, element('small', { text: 'Change' })));

  const search_ = element('input', { type: 'search', name: `${id}-search`, placeholder: 'Search names, subjects, colours…', 'aria-label': `Search ${label.toLowerCase()}`, autocomplete: 'off' });
  const category = element('select', { name: `${id}-category`, 'aria-label': 'Category' });
  const tabs = element('div', { class: 'segmented', role: 'group', 'aria-label': 'Type' });
  const tools = element('div', { class: 'picker-tools' }, tabs, search_, category);
  const count = element('p', { class: 'picker-count', 'aria-live': 'polite' });
  const grid = element('ul', { class: 'picker-grid' });
  const skeleton = element('div', { class: 'picker-skeleton', 'aria-hidden': 'true', hidden: true },
    ...Array.from({ length: 8 }, () => element('span', { class: 'loading-placeholder' })));
  const retry = element('button', { type: 'button', class: 'btn picker-more', text: 'Reload page', hidden: true });
  const more = element('button', { type: 'button', class: 'btn picker-more', text: 'Show more designs', hidden: true });
  const close = element('button', { type: 'button', class: 'btn btn-icon', 'aria-label': 'Close', text: '×' });
  const dialog = element('dialog', { class: 'picker', 'aria-label': `Choose ${label.toLowerCase()}` },
    element('div', { class: 'picker-head' }, element('h2', { text: `Choose ${label.toLowerCase()}` }), close),
    tools, count, skeleton, retry, grid, more);
  document.body.append(dialog);

  function results() {
    const allowed = new Set(search(state.query).map(item => item.name));
    return items.filter(item => allowed.has(item.name) && (state.type === 'all' || item.asset_type === state.type)
      && (!state.category || item.categories.includes(state.category)));
  }
  function renderCategories() {
    const types = [...new Set(items.map(item => item.asset_type))];
    tabs.hidden = types.length < 2;
    tabs.replaceChildren(...['all', ...types].map(type => element('button', { type: 'button', 'data-value': type,
      'aria-pressed': String(type === state.type), text: type === 'all' ? 'All' : typePlural[type] })));
    const counts = new Map();
    for (const item of items.filter(item => state.type === 'all' || item.asset_type === state.type))
      for (const name of item.categories) counts.set(name, (counts.get(name) || 0) + 1);
    if (state.category && !counts.has(state.category)) state.category = '';
    category.replaceChildren(new Option('All categories', ''), ...[...counts].sort(([a], [b]) => a.localeCompare(b)).map(([name, n]) => new Option(`${capital(name)} (${n})`, name)));
    category.value = state.category;
  }
  function render() {
    if (!dialog.open || !loaded) return;
    for (const cleanup of cleanups) cleanup();
    cleanups = [];
    const list = results();
    count.textContent = list.length ? `${list.length} design${list.length === 1 ? '' : 's'}` : 'No designs match. Try another word or category.';
    more.hidden = list.length <= limit;
    grid.replaceChildren(...list.slice(0, limit).map(item => {
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
  async function populate() {
    tools.hidden = grid.hidden = more.hidden = true;
    retry.hidden = true;
    skeleton.hidden = false;
    count.textContent = 'Loading designs…';
    try {
      if (!loaded) { items = await load(); byName = new Map(items.map(item => [item.name, item])); loaded = true; }
      if (!dialog.open) return;
      tools.hidden = grid.hidden = false;
      renderCategories(); render(); search_.focus();
    } catch {
      if (!dialog.open) return;
      count.textContent = 'Could not load the designs. Reload the page to try again.';
      retry.hidden = false;
    } finally { skeleton.hidden = true; }
  }
  trigger.addEventListener('click', () => { search_.value = ''; state.query = ''; limit = 48; dialog.showModal(); populate(); });
  // A failed ES-module dependency remains failed for the life of the document.
  retry.addEventListener('click', () => location.reload());
  more.addEventListener('click', () => { const scroll = grid.scrollTop; limit += 48; render(); grid.scrollTop = scroll; });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  // 'close' fires after a delay; skip it if the picker was already reopened.
  dialog.addEventListener('close', () => { if (dialog.open) return; for (const cleanup of cleanups) cleanup(); cleanups = []; grid.replaceChildren(); });
  search_.addEventListener('input', debounce(() => { state.query = search_.value.trim(); limit = 48; render(); }, 150));
  category.addEventListener('change', () => { state.category = category.value; limit = 48; render(); });
  tabs?.addEventListener('click', event => {
    const button = event.target.closest('button[data-value]');
    if (!button) return;
    state.type = button.dataset.value;
    limit = 48;
    for (const tab of tabs.children) tab.setAttribute('aria-pressed', String(tab === button));
    renderCategories(); render();
  });

  triggerName.textContent = readable(value);
  triggerCleanup = thumbnail(byName.get(value), triggerArt, { lazy: false });
  return { element: trigger, get value() { return current; }, select };
}
