// One observer per window, shared by React, vanilla and the design browser.
// No browser globals at import time; a missing observer loads immediately.
const pools = new WeakMap();
export function observeNearViewport(element, load) {
  const view = element.ownerDocument.defaultView;
  if (!view?.IntersectionObserver) { load(); return () => {}; }
  let pool = pools.get(view);
  if (!pool) {
    const callbacks = new Map();
    const observer = new view.IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const callback = callbacks.get(entry.target);
        if (!callback) continue;
        callbacks.delete(entry.target); observer.unobserve(entry.target);
        callback();
      }
      if (!callbacks.size) { observer.disconnect(); pools.delete(view); }
    }, { rootMargin: '200px' });
    pool = { observer, callbacks }; pools.set(view, pool);
  }
  pool.callbacks.set(element, load); pool.observer.observe(element);
  return () => {
    if (pool.callbacks.get(element) !== load) return;
    pool.callbacks.delete(element); pool.observer.unobserve(element);
    if (!pool.callbacks.size) { pool.observer.disconnect(); pools.delete(view); }
  };
}
