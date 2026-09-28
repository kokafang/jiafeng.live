export function mountMobileNavigation({ nav, strip, media }) {
  if (!nav || !strip) return { close() {} };
  strip.id = 'portal-section-menu';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-menu-toggle';
  toggle.textContent = 'Menu';
  toggle.setAttribute('aria-controls', strip.id);
  nav.insertBefore(toggle, strip);

  function setOpen(value, restoreFocus = false) {
    const open = media.matches && value;
    nav.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    strip.inert = media.matches && !open;
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('pointerdown', event => {
    if (!nav.contains(event.target)) setOpen(false);
  }, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      setOpen(false, true);
    }
  });
  nav.addEventListener('focusout', event => {
    if (event.relatedTarget && !nav.contains(event.relatedTarget)) setOpen(false);
  });
  media.addEventListener('change', () => setOpen(false));
  setOpen(false);
  return { close: () => setOpen(false) };
}
