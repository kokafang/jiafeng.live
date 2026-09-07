export function createLiquidNavigation({ nav, strip, reducedMotion }) {
  if (!nav || !strip) return { update() {} };
  const links = [...strip.querySelectorAll('[data-section-link]')];
  const lens = document.createElement('span');
  lens.className = 'liquid-nav-lens';
  lens.setAttribute('aria-hidden', 'true');
  strip.prepend(lens);
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let positioned = false;
  let readyFrame = null;
  let lightFrame = null;
  let pointer = null;

  function update({ immediate = false } = {}) {
    const active = links.find(link => link.classList.contains('is-active'));
    lens.classList.toggle('has-selection', Boolean(active));
    if (!active) return;
    const mobileStrip = getComputedStyle(strip).overflowX === 'auto';
    const pad = mobileStrip ? -6 : parseFloat(getComputedStyle(active).fontSize) * 0.52;
    if (!positioned || immediate) lens.classList.remove('is-positioned');
    // Coordinates live in the scroll strip, so horizontal touch scrolling moves
    // the lens and its label together without a second animation or wheel handler.
    lens.style.width = `${active.offsetWidth}px`;
    lens.style.height = `${active.offsetHeight + pad * 2}px`;
    lens.style.transform = `translate3d(${active.offsetLeft}px, ${active.offsetTop - pad}px, 0)`;
    positioned = true;
    cancelAnimationFrame(readyFrame);
    readyFrame = requestAnimationFrame(() => lens.classList.add('is-positioned'));
  }

  function resetLight() {
    cancelAnimationFrame(lightFrame);
    lightFrame = null;
    pointer = null;
    nav.style.setProperty('--glass-hover', '0');
    lens.classList.remove('is-pressed');
  }

  nav.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
    pointer = { x: event.clientX, y: event.clientY };
    if (lightFrame !== null) return;
    lightFrame = requestAnimationFrame(() => {
      lightFrame = null;
      if (!pointer) return;
      const box = nav.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, (pointer.x - box.left) / box.width * 100));
      const y = Math.max(0, Math.min(100, (pointer.y - box.top) / box.height * 100));
      nav.style.setProperty('--glass-light-x', `${x}%`);
      nav.style.setProperty('--glass-light-y', `${y}%`);
      nav.style.setProperty('--glass-hover', '1');
    });
  }, { passive: true });
  nav.addEventListener('pointerdown', event => {
    if (!reducedMotion.matches && event.target.closest('.mini-links a.is-active')) lens.classList.add('is-pressed');
  }, { passive: true });
  nav.addEventListener('pointerleave', resetLight);
  window.addEventListener('pointerup', () => lens.classList.remove('is-pressed'), { passive: true });
  window.addEventListener('pointercancel', resetLight, { passive: true });
  window.addEventListener('blur', resetLight);
  reducedMotion.addEventListener('change', resetLight);
  const resize = new ResizeObserver(() => update({ immediate: true }));
  resize.observe(strip);
  links.forEach(link => resize.observe(link));
  document.fonts.ready.then(() => update({ immediate: true }));
  return { update };
}
