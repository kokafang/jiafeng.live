export function fitDesktopSections({ sections, mobilePages }) {
  const root = document.documentElement;
  const contents = sections.filter(section => section.matches('.portal-section'))
    .map(section => ({ section, content: section.querySelector(':scope > div') }));
  const nav = document.querySelector('.portal-mini-nav');
  const heroNav = document.querySelector('.portal-top-nav');
  let frame = null;

  function set(element, name, value) {
    if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
  }

  function fit() {
    frame = null;
    if (mobilePages.matches) return;
    const uiScale = Math.min(1, innerWidth / 1100, innerHeight / 700);
    set(root, '--desktop-ui-scale', String(uiScale));
    set(root, '--desktop-top-safe', `${Math.max(56 * uiScale, (nav?.offsetHeight || 40) + 14 + 24 * uiScale)}px`);
    set(root, '--desktop-bottom-safe', `${Math.max(8, Math.min(56, innerHeight * 0.055))}px`);

    for (const { section, content } of contents) {
      const style = getComputedStyle(section);
      const width = parseFloat(style.gridTemplateColumns.split(' ').at(-1));
      const height = section.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      // Every section shares the same width/scale. Height changes the internal layout only.
      const canvasWidth = Math.max(980, width);
      const scale = Math.min(1, width / canvasWidth);
      const canvasHeight = Math.max(1, height - 2) / scale;
      set(content, '--fit-width', `${canvasWidth}px`);
      set(content, '--fit-height', `${canvasHeight}px`);
      const density = Math.min(1, canvasHeight / 730);
      set(content, '--layout-density', String(density));
      set(content, '--fit-scale', String(scale));
      set(content, '--fit-offset', '0px');
      content.querySelectorAll('.music-feature-description, .webdj-copy, .about-copy, .project-description').forEach(copy => {
        const max = (copy.matches('.project-description') ? 17 : 19.5) * density;
        set(copy, '--copy-font', `${max}px`);
        if (copy.scrollHeight > copy.clientHeight + 1) {
          let low = 6;
          let high = max;
          // Fit only prose, not the entire music player, cover, or page heading.
          for (let i = 0; i < 9; i++) {
            const size = (low + high) / 2;
            set(copy, '--copy-font', `${size}px`);
            if (copy.scrollHeight > copy.clientHeight + 1) high = size;
            else low = size;
          }
          set(copy, '--copy-font', `${low}px`);
        }
      });
      content.scrollTop = 0;
    }
    if (heroNav) {
      set(heroNav, '--hero-nav-scale', String(Math.min(1, (innerWidth - 56) / heroNav.offsetWidth, innerHeight * 0.35 / heroNav.offsetHeight)));
    }
  }

  function schedule() {
    if (frame === null) frame = requestAnimationFrame(fit);
  }
  const resize = new ResizeObserver(schedule);
  contents.forEach(({ content }) => resize.observe(content));
  if (nav) resize.observe(nav);
  if (heroNav) resize.observe(heroNav);
  const changes = new MutationObserver(schedule);
  contents.forEach(({ content }) => changes.observe(content, { childList: true, subtree: true, characterData: true }));
  window.addEventListener('resize', schedule, { passive: true });
  window.visualViewport?.addEventListener('resize', schedule, { passive: true });
  mobilePages.addEventListener('change', schedule);
  document.addEventListener('load', schedule, true);
  document.fonts.ready.then(schedule);
  schedule();
}
