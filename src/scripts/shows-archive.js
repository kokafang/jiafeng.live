import shows from '../content/shows.json';
import { displayShow } from '../content/shows-display.js';
import { createShowSearch } from '../content/show-search.js';
import { localDateKey, showPhase } from '../content/show-phase.js';
import '../styles/shows-archive.css';

export function mountShowsArchive() {
  const host = document.querySelector('[data-shows-archive]');
  if (!host) return;
  host.innerHTML = `
    <header class="shows-header">
      <div class="shows-search" role="search">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>
        <input type="search" aria-label="Search shows by year, city, venue or performance type" aria-controls="shows-results" placeholder="Search shows" title="Search by year, city, venue or performance type" autocomplete="off" spellcheck="false">
        <button type="button" class="shows-search-clear" aria-label="Clear search" hidden>×</button>
      </div>
    </header>
    <div class="shows-column-labels" aria-hidden="true"><span>Date</span><span>Performance</span><span>Location</span><span>Info</span></div>
    <ol class="shows-list" id="shows-results" aria-label="Performance archive, newest first"></ol>
    <footer class="shows-footer">
      <p class="shows-counter" role="status" aria-live="polite" aria-atomic="true"></p>
      <nav class="shows-pagination" aria-label="Performance archive pages">
        <button type="button" data-newer aria-label="Newer performances"><span aria-hidden="true">←</span> Newer</button>
        <button type="button" data-earlier aria-label="Earlier performances">Earlier <span aria-hidden="true">→</span></button>
      </nav>
    </footer>`;

  const search = host.querySelector('input');
  const clear = host.querySelector('.shows-search-clear');
  const list = host.querySelector('.shows-list');
  const newer = host.querySelector('[data-newer]');
  const earlier = host.querySelector('[data-earlier]');
  const counter = host.querySelector('.shows-counter');
  const searchShows = createShowSearch(shows);
  let filtered = shows;
  let page = 0;
  const pageSize = 6;
  const labels = { upcoming: 'Upcoming', past: 'Past' };
  let renderedDay = localDateKey();
  let dayTimer;

  function text(tag, className, value) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = value;
    return element;
  }

  function render(animate = false) {
    const today = localDateKey();
    if (today !== renderedDay) filtered = searchShows(search.value);
    renderedDay = today;
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.max(0, Math.min(page, pages - 1));
    const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
    const rows = visible.map(show => {
      const display = displayShow(show);
      const row = document.createElement('li');
      row.className = 'show-row';
      row.dataset.showId = show.id;
      const date = text('time', 'show-date', show.date + (show.endDate ? ` – ${show.endDate.slice(5)}` : '') + (show.dateUncertain ? ' *' : ''));
      date.dateTime = show.date;
      if (show.time) date.append(text('span', 'show-start-time', show.time));
      const detail = document.createElement('div');
      detail.className = 'show-detail';
      const title = text('span', 'show-event', display.title);
      title.title = display.title;
      const chineseTitle = text('span', 'show-chinese-title', display.chineseTitle);
      chineseTitle.lang = 'zh-CN';
      chineseTitle.title = display.chineseTitle;
      detail.title = `${display.title} ${display.chineseTitle}`.trim();
      detail.append(title, ' ', chineseTitle);
      const location = text('span', 'show-location', display.location);
      const info = document.createElement('div');
      info.className = 'show-info';
      const phase = showPhase(show, renderedDay);
      info.append(text('span', `show-status ${phase}`, labels[phase]));
      if (show.sources.length) {
        const source = text('a', 'show-source', '↗');
        source.href = show.sources[0].url;
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
        source.setAttribute('aria-label', `Source for ${display.title}, ${show.date} (opens in new tab)`);
        source.title = 'View source';
        info.append(source);
      }
      row.append(date, detail, location, info);
      return row;
    });
    if (!rows.length) {
      const empty = document.createElement('li');
      empty.className = 'shows-empty';
      empty.append(text('strong', '', 'No shows found.'), text('span', '', 'Try a year, city, venue or performance type.'));
      rows.push(empty);
    }
    list.getAnimations().forEach(animation => animation.cancel());
    list.replaceChildren(...rows);
    list.style.setProperty('--show-slots', String(pageSize));
    newer.disabled = page === 0;
    earlier.disabled = page >= pages - 1;
    counter.textContent = filtered.length
      ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, filtered.length)} / ${filtered.length} · Page ${page + 1} of ${pages}`
      : '0 results';
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      list.animate([{ opacity: 0.25, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' });
    }
  }

  function updateSearch() {
    filtered = searchShows(search.value);
    clear.hidden = search.value.length === 0;
    page = 0;
    render();
  }
  search.addEventListener('input', event => { if (!event.isComposing) updateSearch(); });
  search.addEventListener('compositionend', updateSearch);
  function clearSearch() {
    search.value = '';
    updateSearch();
    search.focus({ preventScroll: true });
  }
  clear.addEventListener('click', clearSearch);
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !event.isComposing && search.value) {
      event.preventDefault();
      clearSearch();
    }
  });
  newer.addEventListener('click', () => { page -= 1; render(true); });
  earlier.addEventListener('click', () => { page += 1; render(true); });

  // Keep six entries per page; CSS adapts row spacing instead of dropping entries.
  render();

  // Keep open tabs and status-filtered results current across local midnight and device sleep.
  function refreshDate() {
    clearTimeout(dayTimer);
    if (localDateKey() !== renderedDay) {
      filtered = searchShows(search.value);
      render();
    }
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    dayTimer = setTimeout(refreshDate, midnight.getTime() - now.getTime() + 50);
  }
  window.addEventListener('focus', refreshDate);
  window.addEventListener('pageshow', refreshDate);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDate(); });
  refreshDate();
}
