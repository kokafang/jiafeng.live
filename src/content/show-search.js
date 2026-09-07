import { displayShow } from './shows-display.js';

function normalize(value) {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function createShowSearch(shows) {
  const entries = shows.map(show => {
    const display = displayShow(show);
    const value = normalize([show.date, show.endDate, show.event, show.location, show.performance, show.status,
      display.title, display.chineseTitle, display.venue, display.fullLocation].filter(Boolean).join(' '));
    return { show, value, compact: value.replaceAll(' ', '') };
  });
  return query => {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    return entries.filter(({ value, compact }) => terms.every(term => value.includes(term) || compact.includes(term)))
      .map(entry => entry.show);
  };
}
