import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseArchive } from './import-shows.mjs';
import { displayShow } from '../src/content/shows-display.js';
import { createShowSearch } from '../src/content/show-search.js';

const fixture = `## 逐场档案
| 2020-01-02 | City | Venue | Live | [source][W1] · 旧站记载 |
| 2021-02-03（待核） | City | Festival | DJ | [source][C1] · 活动公告 |
| 2021-02-03 | City | Another venue | 未注明 | [source][C1] · 现场留档 |
| 2026-08-29（待核） | 地点待核 | Plan | 未注明 | tentative，不能标作已完成 |
## 未能定位到单日的线索
| 2022-01-01 | City | Excluded lead | Live | [source][C1] |
[W1]: https://example.com/artist
[C1]: https://example.com/venue`;

test('preserves same-day events, uncertainty, sources and descending dates', () => {
  const rows = parseArchive(fixture);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map(row => row.date), ['2021-02-03', '2021-02-03', '2020-01-02']);
  assert.equal(rows[0].dateUncertain, true);
  assert.equal(rows[0].status, 'provisional');
  assert.equal(rows[1].performance, '');
  assert.equal(rows[1].status, 'documented');
  assert.equal(rows[2].sources[0].url, 'https://example.com/artist');
});

test('public titles combine format and place, with Chinese subtitles and English cities', () => {
  const rows = JSON.parse(readFileSync(new URL('../src/content/shows.json', import.meta.url)));
  for (const row of rows) {
    const display = displayShow(row);
    assert.ok(['Live set', 'DJ set', 'Hybrid set', 'Web DJ', 'Panel speaker'].includes(display.format));
    assert.ok(display.title.startsWith(`${display.format} at `));
    assert.match(display.chineseTitle, /\p{Script=Han}/u);
    assert.doesNotMatch(display.location, /\p{Script=Han}/u, row.location);
    assert.doesNotMatch(display.location, /,|China|US|Taiwan|France/);
    assert.doesNotMatch(display.venue, /\p{Script=Han}/u, row.event);
  }
  const base = {event:'OIL', location:'深圳，中国'};
  assert.equal(displayShow({...base, performance:'Browser DJ / Web-DJ'}).title, 'Web DJ at OIL');
  assert.equal(displayShow({...base, performance:'DJ + Live'}).title, 'Hybrid set at OIL');
  assert.equal(displayShow({...base, performance:'DJ set'}).title, 'DJ set at OIL');
  assert.equal(displayShow({...base, performance:'Solo live'}).title, 'Live set at OIL');
  assert.equal(displayShow({...base, performance:''}).formatUncertain, true);
  const strawberry = rows.find(show => show.date === '2025-06-14');
  assert.equal(displayShow(strawberry).title, 'DJ set at Hangzhou Strawberry Music Festival');
  assert.equal(displayShow(strawberry).chineseTitle, 'DJ 演出 · 杭州草莓音乐节');
  assert.equal(displayShow({...base, performance:'Live', location:'New York / Brooklyn，美国'}).location, 'New York');
  assert.equal(displayShow({...base, performance:'Live', event:'对冲联合巡演；场地待公布（原公告）'}).title, 'Live set at an unconfirmed venue');
});

test('August 2024 tour venues use artist corrections and remain searchable', () => {
  const rows = JSON.parse(readFileSync(new URL('../src/content/shows.json', import.meta.url)));
  const search = createShowSearch(rows);
  const hangzhou = rows.find(show => show.date === '2024-08-23');
  const shanghai = rows.find(show => show.date === '2024-08-25');
  assert.equal(displayShow(hangzhou).title, 'Live set at 9 Club');
  assert.equal(displayShow(hangzhou).chineseTitle, '现场演出 · 酒球会');
  assert.equal(displayShow(shanghai).title, 'Live set at YYT Yuyintang');
  assert.equal(displayShow(shanghai).chineseTitle, '现场演出 · YYT 育音堂');
  assert.deepEqual(search('2024 酒球会'), [hangzhou]);
  assert.deepEqual(search('2024 YYT'), [shanghai]);
  assert.deepEqual(search('2024 育音堂'), [shanghai]);
});

test('search supports years, cities, venues, formats, Chinese and multiple terms', () => {
  const rows = JSON.parse(readFileSync(new URL('../src/content/shows.json', import.meta.url)));
  const search = createShowSearch(rows);
  assert.deepEqual(search('  '), rows);
  for (const query of ['2015', 'New York', 'OIL', 'Web DJ', 'webdj', '杭州', '2024 Ningbo', 'mecanique']) {
    assert.ok(search(query).length, `No matches for ${query}`);
  }
  assert.ok(search('2015').every(show => show.year === 2015));
  assert.ok(search('New York').every(show => displayShow(show).location === 'New York'));
  assert.ok(search('Web DJ').every(show => displayShow(show).format === 'Web DJ'));
  assert.ok(search('2024 Ningbo').every(show => show.year === 2024 && displayShow(show).location === 'Ningbo'));
  assert.deepEqual(search('webdj'), search('Web DJ'));
  assert.deepEqual(search('mecanique'), search('Mécanique'));
  assert.deepEqual(search('nonexistent-show-xyz'), []);
  assert.deepEqual(search(''), rows);
  const filtered = search('Live');
  assert.deepEqual(filtered, [...filtered].sort((a, b) => b.date.localeCompare(a.date)));
});

test('site archive has unique IDs, real dates, known statuses and safe links', () => {
  const rows = JSON.parse(readFileSync(new URL('../src/content/shows.json', import.meta.url)));
  assert.equal(rows.length, 167);
  assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
  rows.forEach((row, i) => {
    assert.equal(new Date(row.date).toISOString().slice(0, 10), row.date);
    assert.ok(['provisional', 'documented', 'artist-archive', 'artist-confirmed', 'listing', 'upcoming'].includes(row.status));
    row.sources.forEach(source => assert.match(source.url, /^https?:\/\//));
    if (i) assert.ok(rows[i - 1].date >= row.date);
  });
  assert.equal(rows[0].date, '2026-10-06');
  assert.equal(rows.at(-1).date, '2009-02-14');
  for (const date of ['2015-12-23', '2015-12-26', '2015-12-27']) {
    const row = rows.find(show => show.date === date);
    assert.equal(row.dateUncertain, true, `${date} must retain its uncertain year`);
    assert.equal(row.status, 'provisional');
  }
});

test('full date searches do not confuse month and day, and include event intervals', () => {
  const rows = JSON.parse(readFileSync(new URL('../src/content/shows.json', import.meta.url)));
  const search = createShowSearch(rows);
  assert.deepEqual(search('2026-03-03').map(show => show.event), ['WebM']);
  assert.deepEqual(search('2026-03-20 Shanghai').map(show => show.event), ['Dweller']);
  assert.deepEqual(search('2025-10-24').map(show => show.event), ['IMX（International Music X）']);
  assert.deepEqual(search('2026-03-03 Shanghai'), []);
});

test('artist-supplied shows are added once, with correct formats and missing-city handling', () => {
  const rows = JSON.parse(readFileSync(new URL('../src/content/shows.json', import.meta.url)));
  const expected = [
    ['2024-11-02', 'Live set', 'Shanghai'],
    ['2025-06-01', 'Live set', 'Changsha'],
    ['2025-06-14', 'DJ set', 'Hangzhou'],
    ['2025-10-22', 'Panel speaker', 'Shanghai'],
    ['2026-01-01', 'Live set', 'Ningbo'],
    ['2026-03-03', 'Web DJ', 'Not recorded'],
    ['2026-03-20', 'Web DJ', 'Shanghai'],
    ['2026-05-29', 'Web DJ', 'Dali'],
    ['2026-07-17', 'Web DJ', 'Shenzhen'],
  ];
  for (const [date, format, location] of expected) {
    const matches = rows.filter(show => show.date === date);
    assert.equal(matches.length, 1, `duplicate or missing ${date}`);
    const show = matches[0];
    assert.equal(show.status, 'artist-confirmed', date);
    assert.equal(displayShow(show).format, format, date);
    assert.equal(displayShow(show).location, location, date);
    assert.equal(displayShow(show).formatUncertain, false, date);
  }
  assert.equal(rows.find(show => show.date === '2025-10-22').endDate, '2025-10-25');
  assert.equal(rows.filter(show => show.status === 'artist-confirmed').length, 9);
});

test('upcoming section exports future appearances separately without private notes', () => {
  const rows = JSON.parse(readFileSync(new URL('../src/content/shows.json', import.meta.url)));
  const upcoming = rows.filter(show => show.status === 'upcoming');
  assert.deepEqual(upcoming.map(show => show.date), ['2026-10-06', '2026-10-03', '2026-10-02', '2026-09-26']);
  assert.equal(displayShow(upcoming[0]).title, 'Panel speaker at AIPPI');
  assert.equal(displayShow(upcoming[0]).location, 'Hamburg');
  assert.equal(displayShow(upcoming[1]).title, 'Web DJ at Reactor');
  assert.equal(displayShow(upcoming[2]).title, 'Web DJ at illum');
  assert.equal(upcoming[3].time, '20:00');
  assert.equal(displayShow(upcoming[3]).title, 'Live set at Yuyintang Town C Hall');
  assert.deepEqual(createShowSearch(rows)('upcoming'), upcoming);
  assert.doesNotMatch(JSON.stringify(rows), /分票房|联系人|\/Users\//);
  assert.ok(!rows.some(show => show.date === '2026-08-29'));
});

test('confirmation of a venue alone is not confirmation of the whole performance', () => {
  const parsed = parseArchive(`## 逐场档案
| 2024-08-23 | 杭州 | Venue | Live | 本人补充确认场地，演后情况待核 |
| 2026-03-20 | 上海 | Dweller | Web DJ | 本人确认出演：2026-09-07 补充 |
## 未能定位到单日的线索
## 未来行程（Upcoming）
| 2026-10-03 | 上海 | Reactor | Web DJ | 本人确认未来行程 |
| 2026-10-04 | 上海 | Excluded | Web DJ | 已取消 |
## 来源索引`);
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].status, 'upcoming');
  assert.equal(parsed[1].status, 'artist-confirmed');
  assert.equal(parsed[2].status, 'listing');
});
