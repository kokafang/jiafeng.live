import { getPressPage, pressCategories } from '../content/press.js';
import '../styles/press-archive.css';

export function mountPressArchive() {
  const host = document.querySelector('[data-press-archive]');
  if (!host) return;
  let category = 'all';
  let page = 0;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  const filters = element('div', 'press-filters');
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filter press sources');
  const filterButtons = pressCategories.map(option => {
    const button = element('button', '', option.label);
    button.type = 'button';
    button.addEventListener('click', () => { category = option.id; page = 0; render(); });
    filters.append(button);
    return button;
  });
  const list = element('ul', 'press-list');
  list.id = 'press-results';
  list.setAttribute('aria-label', 'Selected coverage and records');
  const footer = element('div', 'press-footer');
  const counter = element('span', 'press-counter');
  counter.setAttribute('role', 'status');
  const pagination = element('div', 'press-pagination');
  const previous = element('button', '', 'Previous');
  const next = element('button', '', 'Next');
  for (const button of [previous, next]) {
    button.type = 'button';
    button.setAttribute('aria-controls', list.id);
  }
  previous.setAttribute('aria-label', 'Previous press page');
  next.setAttribute('aria-label', 'Next press page');
  previous.addEventListener('click', () => { page -= 1; render(); });
  next.addEventListener('click', () => { page += 1; render(); });
  pagination.append(previous, next);
  footer.append(counter, pagination);
  host.append(filters, list, footer);

  function render() {
    const result = getPressPage(category, page);
    page = result.page;
    filterButtons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(pressCategories[index].id === category));
    });
    list.replaceChildren(...result.items.map(item => {
      const row = element('li');
      const link = element('a', 'press-card');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const thumbnail = element('div', 'press-thumbnail');
      const image = element('img');
      image.src = item.thumbnail.src;
      image.alt = item.thumbnail.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      thumbnail.append(image);
      const copy = element('div', 'press-card-copy');
      const meta = element('div', 'press-card-meta');
      const date = element('time', '', item.published.slice(0, 4));
      date.dateTime = item.published;
      meta.append(element('span', '', item.publisher), date);
      const heading = element('h3', '', item.title);
      const description = element('p', '', item.description);
      const source = element('div', 'press-card-source');
      const arrow = element('span', 'press-card-arrow', '\u2197');
      arrow.setAttribute('aria-hidden', 'true');
      source.append(element('span', '', `${item.kind} / ${item.language}`), arrow);
      copy.append(meta, heading, description, source);
      link.append(thumbnail, copy);
      row.append(link);
      return row;
    }));
    counter.textContent = `${page + 1} / ${result.pageCount} \u00b7 ${result.total} sources`;
    previous.disabled = page === 0;
    next.disabled = page >= result.pageCount - 1;
    if (document.documentElement.classList.contains('mobile-pages')) {
      host.closest('.portal-section')?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  render();
}
