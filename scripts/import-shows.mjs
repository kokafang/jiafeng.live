import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function parseArchive(markdown) {
  const sources = Object.fromEntries([...markdown.matchAll(/^\[([^\]]+)\]:\s+(https?:\S+)/gm)]
    .map(match => [match[1], match[2]]));
  const main = markdown.split('## 逐场档案')[1]?.split('## 未能定位到单日的线索')[0];
  if (!main) throw new Error('The dated archive section was not found.');
  const upcoming = markdown.split('## 未来行程（Upcoming）')[1]?.split('\n## ')[0] || '';
  const entries = [
    ...main.split('\n').map(line => ({ line, upcoming: false })),
    ...upcoming.split('\n').map(line => ({ line, upcoming: true })),
  ];
  return entries.filter(({ line }) => /^\| \d{4}/.test(line)).flatMap(({ line, upcoming }, index) => {
    const [dateText, location, event, performance, evidence] = line.split('|').slice(1, -1).map(s => s.trim());
    // Plans without an identifiable performance are retained in the research doc only.
    if (/取消/.test(evidence) || (!upcoming && /tentative|不能标作已完成|未来计划/.test(evidence))) return [];
    const dates = [...dateText.matchAll(/\d{4}-\d{2}-\d{2}/g)].map(m => m[0]);
    if (!dates.length) throw new Error(`Missing date: ${dateText}`);
    const refs = [...evidence.matchAll(/\[[^\]]+\]\[([^\]]+)\]/g)]
      .map(m => ({ label: m[1], url: sources[m[1]] })).filter(ref => ref.url);
    const dateUncertain = /待核|年份/.test(dateText) || /年份待核|不擅自改为\s*\d{4}/.test(evidence);
    const status = upcoming ? 'upcoming'
      : /本轮未|旧稿引文|本地旧稿|地点有冲突/.test(`${evidence} ${location}`) || dateUncertain
      ? 'provisional'
      : /本人确认出演|本人确认参与/.test(evidence) ? 'artist-confirmed'
      : /现场留档|演后|节目留档/.test(evidence.replace(/演后情况待核/g, '')) && !/是否举行待补/.test(evidence)
        ? 'documented' : /\[W[124]\]/.test(evidence) ? 'artist-archive' : 'listing';
    const time = upcoming ? performance.match(/\b([01]\d|2[0-3]):[0-5]\d\b/)?.[0] : null;
    return [{ id: `show-${dates[0]}-${index}`, date: dates[0], endDate: dates[1] || null,
      dateUncertain, year: Number(dates[0].slice(0, 4)), location, event,
      performance: performance === '未注明' ? '' : performance, status, sources: refs,
      ...(time ? { time } : {}) }];
  }).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Usage: node scripts/import-shows.mjs archive.md output.json');
  const shows = parseArchive(readFileSync(input, 'utf8'));
  writeFileSync(output, `${JSON.stringify(shows, null, 2)}\n`);
  console.log(`Imported ${shows.length} dated archive entries into ${output}`);
}
