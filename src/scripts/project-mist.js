export function mountProjectMist({ finePointer, reducedMotion }) {
  const section = document.querySelector('#products');
  if (!section) return { setPaused() {} };
  let visible = false;
  let paused = false;
  let disposed = false;
  let failed = false;
  let loading = false;
  let effect = null;
  const events = new AbortController();

  function enabled() {
    return !disposed && !failed && visible && !paused && !document.hidden &&
      finePointer.matches && !reducedMotion.matches;
  }

  async function sync() {
    if (!enabled()) { effect?.pause(); return; }
    if (effect) { effect.start(); return; }
    if (loading) return;
    loading = true;
    try {
      const { createProjectMist } = await import('./project-mist-renderer.js');
      if (disposed) return;
      effect = createProjectMist(section);
      if (!effect) { failed = true; return; }
      if (enabled()) effect.start();
    } catch (error) {
      failed = true;
      console.warn('Project mist unavailable; keeping the static blue tint.', error);
    } finally {
      loading = false;
    }
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio > 0.1;
    sync();
  }, { threshold: [0, 0.1, 0.2] });
  observer.observe(section);
  finePointer.addEventListener('change', sync, { signal: events.signal });
  reducedMotion.addEventListener('change', sync, { signal: events.signal });
  document.addEventListener('visibilitychange', sync, { signal: events.signal });
  window.addEventListener('pagehide', event => {
    if (event.persisted) effect?.pause();
    else dispose();
  }, { signal: events.signal });
  window.addEventListener('pageshow', sync, { signal: events.signal });

  function dispose() {
    disposed = true;
    events.abort();
    observer.disconnect();
    effect?.dispose();
  }
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  return { setPaused(value) { paused = value; sync(); }, dispose };
}
