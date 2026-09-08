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
    set(root, '--desktop-top-safe', `${Math.ceil(Math.max(56 * uiScale, (nav?.offsetHeight || 40) + 14 + 24 * uiScale))}px`);
    set(root, '--desktop-bottom-safe', `${Math.round(Math.max(8, Math.min(56, innerHeight * 0.055)))}px`);

    for (const { section, content } of contents) {
      const style = getComputedStyle(section);
      const height = section.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      // Reflow at the real viewport width; do not resample a scaled text canvas.
      const density = Math.min(1, height / 730);
      set(content, '--layout-density', String(density));
      content.querySelectorAll('.music-feature-description, .webdj-copy, .about-copy').forEach(copy => {
        const max = Math.round(21 * Math.max(0.86, density));
        set(copy, '--copy-font', `${max}px`);
        if (copy.scrollHeight > copy.clientHeight + 1) {
          let low = 10;
          let high = max;
          // Fit only prose, not the entire music player, cover, or page heading.
          for (let i = 0; i < 9; i++) {
            const size = (low + high) / 2;
            set(copy, '--copy-font', `${size}px`);
            if (copy.scrollHeight > copy.clientHeight + 1) high = size;
            else low = size;
          }
          set(copy, '--copy-font', `${Math.floor(low)}px`);
        }
      });
      if (section.id === 'products') {
        const grid = content.querySelector('.section-fill');
        const cards = [...grid.children].filter(card => !card.hidden);
        set(content, '--projects-fit-width', '100%');
        let bestWidth = grid.getBoundingClientRect().width;
        let bestOverflow = Infinity;
        // Preserve 4:3 artwork: fit the grid's width in short windows, never its image height.
        for (let i = 0; i < 8; i++) {
          const overflow = Math.max(0, ...cards.map(card => {
            const stack = card.querySelector('.project-link-card') || card;
            return stack.scrollHeight - stack.clientHeight;
          }));
          if (overflow <= 1) break;
          const width = grid.getBoundingClientRect().width;
          if (overflow >= bestOverflow) {
            set(content, '--projects-fit-width', bestWidth + 'px');
            break;
          }
          bestOverflow = overflow;
          bestWidth = width;
          const next = Math.max(Math.min(720, content.clientWidth), width - (overflow + 2) * 16 / 3);
          if (next >= width) break;
          set(content, '--projects-fit-width', next + 'px');
        }
      }
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
  document.addEventListener('projects:pagechange', schedule);
  document.addEventListener('site:languagechange', schedule);
  document.fonts.ready.then(schedule);
  schedule();
}
