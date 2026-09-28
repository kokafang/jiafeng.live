import { createHash } from 'node:crypto';
import { parseArchive } from './import-shows.mjs';

const requiredSections = ['逐场档案', '未能定位到单日的线索', '未来行程（Upcoming）', '来源索引'];
const publicFields = ['id', 'date', 'endDate', 'dateUncertain', 'year', 'location', 'event', 'performance', 'status', 'sources', 'time'];
const statuses = new Set(['provisional', 'documented', 'artist-archive', 'artist-confirmed', 'listing', 'upcoming']);
const identity = show => JSON.stringify([show.date, show.location, show.event]);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateURL(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Invalid source reference URL.'); }
  if (!/^https?:\/\//.test(value) || /\s/.test(value) || !url.hostname || !['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Source reference URL must be an absolute HTTP(S) URL.');
  }
}

function validateSource(markdown) {
  if (!nonempty(markdown)) throw new Error('Source sections are missing.');
  const lines = markdown.split(/\r?\n/);
  const headings = [...lines.entries()].flatMap(([index, line]) => {
    const match = line.match(/^## (.+?)\s*$/);
    return match ? [{ name: match[1], index }] : [];
  });
  const sections = new Map();
  let previousIndex = -1;
  for (const name of requiredSections) {
    const matches = headings.filter(heading => heading.name === name);
    if (matches.length !== 1 || matches[0].index <= previousIndex) {
      throw new Error('Required archive sections must occur exactly once and in order.');
    }
    previousIndex = matches[0].index;
    sections.set(name, previousIndex);
  }

  const references = new Map();
  for (const line of lines) {
    const definition = line.match(/^\[([^\]]+)\]:\s*(.*)$/);
    if (!definition) continue;
    if (references.has(definition[1])) throw new Error('Duplicate source reference definition.');
    references.set(definition[1], definition[2]);
  }

  let publicCount = 0;
  for (const name of ['逐场档案', '未来行程（Upcoming）']) {
    const start = sections.get(name);
    const end = name === '逐场档案' ? sections.get('未能定位到单日的线索')
      : (headings.find(heading => heading.index > start)?.index ?? lines.length);
    for (let index = start + 1; index < end; index += 1) {
      const line = lines[index];
      if (!line.includes('|') && !/^\s*\d{4}(?:[-/]|[ \t]+\d)/.test(line)) continue;
      if (!line.startsWith('|') || !line.trimEnd().endsWith('|')) {
        throw new Error(`Malformed archive table row at line ${index + 1}.`);
      }
      const cells = line.trimEnd().split('|').slice(1, -1).map(cell => cell.trim());
      if (cells.length !== 5) throw new Error(`Expected five table columns at line ${index + 1}.`);
      if (cells.every(cell => /^:?-{3,}:?$/.test(cell))) continue;
      if (['日期', '原记日期'].includes(cells[0])) continue;
      if (!/^\| \d{4}/.test(line) || cells.some(cell => !nonempty(cell))) {
        throw new Error(`Malformed date row or empty required value at line ${index + 1}.`);
      }
      const [dateText, , , , evidence] = cells;
      const dates = dateText.match(/^(\d{4}-\d{2}-\d{2})(?:\s*(?:至|[-–—~～])\s*(\d{4}-\d{2}-\d{2}))?(?:[（(][^()（）\d\r\n]*[）)]|[?？])?$/);
      if (!dates || !validDate(dates[1]) || (dates[2] && (!validDate(dates[2]) || dates[2] < dates[1]))) {
        throw new Error(`Invalid date or date range at line ${index + 1}.`);
      }
      if (evidence.replace(/\[[^\]]+\]\[[^\]]+\]/g, '').includes('][')) {
        throw new Error(`Malformed source reference at line ${index + 1}.`);
      }
      for (const match of evidence.matchAll(/\[[^\]]+\]\[([^\]]+)\]/g)) {
        if (!references.has(match[1])) throw new Error(`Unresolved source reference at line ${index + 1}.`);
        validateURL(references.get(match[1]));
      }
      // Keep the importer's explicit exclusions, while validating even excluded rows.
      if (/取消/.test(evidence) || (name === '逐场档案' && /tentative|不能标作已完成|未来计划/.test(evidence))) continue;
      publicCount += 1;
    }
  }
  return publicCount;
}

function validateShows(shows) {
  if (!Array.isArray(shows)) throw new Error('Public shows must be an array.');
  const ids = new Set();
  const identities = new Set();
  for (const show of shows) {
    if (!show || typeof show !== 'object' || Object.keys(show).some(key => !publicFields.includes(key))) {
      throw new Error('Unknown public show field.');
    }
    if (!['id', 'date', 'location', 'event', 'status'].every(key => nonempty(show[key]))
      || typeof show.performance !== 'string' || typeof show.dateUncertain !== 'boolean'
      || !statuses.has(show.status) || !Array.isArray(show.sources)) {
      throw new Error('Invalid required public show value.');
    }
    if (!validDate(show.date) || show.year !== Number(show.date.slice(0, 4))
      || (show.endDate !== null && (!validDate(show.endDate) || show.endDate < show.date))) {
      throw new Error('Invalid public show date or range.');
    }
    if ('time' in show && !/^([01]\d|2[0-3]):[0-5]\d$/.test(show.time)) throw new Error('Invalid public show time.');
    for (const source of show.sources) {
      if (!source || typeof source !== 'object' || Object.keys(source).some(key => !['label', 'url'].includes(key))
        || !nonempty(source.label) || !nonempty(source.url)) throw new Error('Invalid public source field.');
      validateURL(source.url);
    }
    if (ids.has(show.id)) throw new Error('Duplicate public show ID.');
    if (identities.has(identity(show))) throw new Error('Duplicate event identity.');
    ids.add(show.id);
    identities.add(identity(show));
  }
}

function semanticData(shows) {
  return JSON.stringify([...shows].sort((a, b) => identity(a).localeCompare(identity(b))).map(show =>
    Object.fromEntries(publicFields.filter(key => key !== 'id' && key in show).map(key => [key,
      key === 'sources' ? show.sources.map(source => ({ label: source.label, url: source.url })) : show[key],
    ]))));
}

/** Validate one source snapshot without writing files or exposing research notes. */
export function prepareShowsSync(markdown, previousShows) {
  validateShows(previousShows);
  const expectedCount = validateSource(markdown);
  const shows = parseArchive(markdown);
  validateShows(shows);
  if (shows.length !== expectedCount) throw new Error('Importer silently dropped a validated source row.');
  if (!shows.length) throw new Error('Refusing an empty public shows archive.');
  if (shows.length < previousShows.length * 0.9) throw new Error('Public record count decrease exceeds 10%.');

  const previousIds = new Map(previousShows.map(show => [identity(show), show.id]));
  const usedIds = new Set(previousShows.map(show => show.id));
  for (const show of [...shows].sort((a, b) => identity(a).localeCompare(identity(b)))) {
    const existing = previousIds.get(identity(show));
    if (existing) { show.id = existing; continue; }
    const digest = createHash('sha256').update(identity(show)).digest('hex');
    const base = `show-${show.date}-${digest.slice(0, 16)}`;
    let id = base;
    let suffix = 1;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    show.id = id;
    usedIds.add(id);
  }
  shows.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  return { shows, serialized: `${JSON.stringify(shows, null, 2)}\n`, changed: semanticData(shows) !== semanticData(previousShows) };
}
