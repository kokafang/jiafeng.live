import '../styles/projects-gallery.css';

export function mountProjectsGallery() {
  const section = document.querySelector('#products');
  const grid = section?.querySelector('.section-fill');
  if (!grid) return;
  const cards = [...grid.children];
  const pageSize = 8;
  const pageCount = Math.ceil(cards.length / pageSize);
  if (pageCount <= 1) return;
  let page = 0;

  grid.id = 'project-results';
  const footer = document.createElement('div');
  footer.className = 'projects-footer';
  const counter = document.createElement('span');
  counter.className = 'projects-counter';
  counter.setAttribute('role', 'status');
  const controls = document.createElement('nav');
  controls.className = 'projects-pagination';
  controls.setAttribute('aria-label', 'Project pages');
  const buttons = ['Previous', 'Next'].map((label, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-label', label + ' projects page');
    button.setAttribute('aria-controls', grid.id);
    button.addEventListener('click', () => {
      page = Math.max(0, Math.min(pageCount - 1, page + (index ? 1 : -1)));
      render();
      if (document.documentElement.classList.contains('mobile-pages')) {
        section.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
    controls.append(button);
    return button;
  });
  footer.append(counter, controls);
  grid.after(footer);

  function render() {
    cards.forEach((card, index) => {
      const hidden = Math.floor(index / pageSize) !== page;
      if (hidden && !card.hidden) {
        card.querySelectorAll('iframe[src^="https://www.youtube.com/embed/"]').forEach(frame => {
          frame.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
            'https://www.youtube.com'
          );
        });
      }
      // Keep nodes and their existing player listeners when changing pages.
      card.hidden = hidden;
    });
    counter.textContent = (page + 1) + ' / ' + pageCount + ' \u00b7 ' + cards.length + ' projects';
    buttons[0].disabled = page === 0;
    buttons[1].disabled = page === pageCount - 1;
    document.dispatchEvent(new Event('projects:pagechange'));
  }

  render();
}
