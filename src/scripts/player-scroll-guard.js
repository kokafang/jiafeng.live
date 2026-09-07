// Cross-origin players cannot bubble wheel events to the page. Let them take
// pointer input only after an explicit interaction, not when a page lands below it.
export function guardPlayerScrolling({ mobilePages }) {
  const containers = [...document.querySelectorAll('.album-player-panel, .video-embed-wrap')];
  const buttons = new Map();
  const tabStops = new WeakMap();
  let activeContainer = null;

  function sync(container) {
    const frames = [...container.querySelectorAll('iframe')];
    const guarded = !mobilePages.matches && frames.length > 0 && container !== activeContainer;
    container.classList.toggle('is-scroll-guarded', guarded);
    buttons.get(container).hidden = !guarded;
    frames.forEach(frame => {
      if (!tabStops.has(frame)) tabStops.set(frame, frame.getAttribute('tabindex'));
      if (guarded) frame.setAttribute('tabindex', '-1');
      else {
        const original = tabStops.get(frame);
        if (original === null) frame.removeAttribute('tabindex');
        else frame.setAttribute('tabindex', original);
      }
    });
  }

  function guardAll() {
    if (!activeContainer) return;
    const previous = activeContainer;
    activeContainer = null;
    sync(previous);
  }

  function activate(frame) {
    if (mobilePages.matches || !frame) return;
    const container = frame.closest('.album-player-panel, .video-embed-wrap');
    if (!buttons.has(container)) return;
    guardAll();
    activeContainer = container;
    sync(container);
  }

  containers.forEach(container => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'player-scroll-guard';
    button.setAttribute('aria-label', 'Activate player controls');
    const hint = document.createElement('span');
    hint.textContent = 'Click to use player';
    button.append(hint);
    buttons.set(container, button);
    container.append(button);
    button.addEventListener('click', () => {
      const frame = container.querySelector('iframe:not([inert])');
      activate(frame);
      frame?.focus({ preventScroll: true });
    });
    container.addEventListener('pointerleave', () => {
      if (activeContainer === container) guardAll();
    });
    new MutationObserver(() => sync(container)).observe(container, { childList: true });
    sync(container);
  });

  document.addEventListener('pointerdown', event => {
    if (activeContainer && !activeContainer.contains(event.target)) guardAll();
  }, { capture: true, passive: true });
  document.addEventListener('focusin', event => {
    if (event.target instanceof HTMLIFrameElement) activate(event.target);
    else if (activeContainer && !activeContainer.contains(event.target)) guardAll();
  });
  // Focusing inside a frame blurs the parent window rather than bubbling focusin.
  window.addEventListener('blur', () => {
    if (document.activeElement instanceof HTMLIFrameElement) activate(document.activeElement);
  });
  window.addEventListener('scroll', guardAll, { passive: true });
  mobilePages.addEventListener('change', () => {
    activeContainer = null;
    containers.forEach(sync);
  });
  return { guardAll, activate };
}
