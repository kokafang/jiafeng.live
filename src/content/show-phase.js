export function localDateKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function showPhase(show, today = localDateKey()) {
  return (show.endDate || show.date) < today ? 'past' : 'upcoming';
}
