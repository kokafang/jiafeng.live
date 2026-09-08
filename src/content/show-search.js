import { displayShow } from './shows-display.js';
import { localDateKey, showPhase } from './show-phase.js';

function normalize(value) {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function createShowSearch(shows) {
  const entries = shows.map(show => {
    const display = displayShow(show);
    const value = normalize([show.date, show.endDate, show.event, show.location, show.performance,
      display.title, display.chineseTitle, display.venue, display.location, display.fullLocation].filter(Boolean).join(' '));
    return { show, value, compact: value.replaceAll(' ', '') };
  });
  return (query, now = new Date()) => {
    const today = localDateKey(now);
    const normalizedQuery = query.normalize('NFKD');
    const dates = normalizedQuery.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
    const terms = normalize(normalizedQuery.replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ')).split(/\s+/).filter(Boolean);
    // A complete date matches a single day or a recorded event interval, not separate month/day tokens.
    return entries.filter(({ show, value, compact }) =>
      dates.every(date => date >= show.date && date <= (show.endDate || show.date)) &&
      terms.every(term => term === 'past' || term === 'upcoming'
        ? showPhase(show, today) === term
        : value.includes(term) || compact.includes(term)))
      .map(entry => entry.show);
  };
}
