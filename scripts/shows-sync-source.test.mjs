import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { prepareShowsSync } from './shows-sync-source.mjs';

const row = (date = '2026-01-02', event = 'Venue', evidence = '[source][W1] · 活动公告', location = 'City') =>
  `| ${date} | ${location} | ${event} | Live | ${evidence} |`;
const archive = (past = [row()], upcoming = [], definitions = '[W1]: https://example.com/archive') => `## 逐场档案
| 日期 | 城市 | 活动 | 形式 | 证据 |
|---|---|---|---|---|
${past.join('\n')}
## 未能定位到单日的线索
## 未来行程（Upcoming）
| 日期 | 城市 | 活动 | 形式 | 证据 |
|---|---|---|---|---|
${upcoming.join('\n')}
## 来源索引
${definitions}
`;
const baseline = [{
  id: 'show-2026-01-02-0', date: '2026-01-02', endDate: null, dateUncertain: false,
  year: 2026, location: 'City', event: 'Venue', performance: 'Live', status: 'artist-archive',
  sources: [{ label: 'W1', url: 'https://example.com/archive' }],
}];

test('unchanged public data preserves IDs and serializes exactly with a final newline', () => {
  const result = prepareShowsSync(archive(), baseline);
  assert.deepEqual(result.shows, baseline);
  assert.equal(result.serialized, JSON.stringify(baseline, null, 2) + '\n');
  assert.equal(result.changed, false);
});

test('historical insertion preserves old IDs and new IDs are deterministic across source order', () => {
  const added = row('2020-01-01', 'New venue');
  const first = prepareShowsSync(archive([added, row()]), baseline);
  const reordered = prepareShowsSync(archive([row(), added]), baseline);
  assert.equal(first.changed, true);
  assert.equal(first.shows.find(show => show.event === 'Venue').id, baseline[0].id);
  assert.deepEqual(first.shows, reordered.shows);
  const repeat = prepareShowsSync(archive([row(), added]), first.shows);
  assert.equal(repeat.changed, false);
});

test('new IDs cannot collide with IDs already assigned to a different identity', () => {
  const newRow = row('2020-01-01', 'New venue');
  const generated = prepareShowsSync(archive([newRow]), []).shows[0].id;
  const previous = [{ ...baseline[0], id: generated }];
  const result = prepareShowsSync(archive([row(), newRow]), previous);
  assert.equal(new Set(result.shows.map(show => show.id)).size, 2);
  assert.equal(result.shows.find(show => show.event === 'Venue').id, generated);
  assert.deepEqual(prepareShowsSync(archive([row(), newRow]), previous).shows, result.shows);
});

test('distinct same-day venues survive but duplicate event identities are rejected', () => {
  assert.equal(prepareShowsSync(archive([row(), row('2026-01-02', 'Another venue')]), baseline).shows.length, 2);
  assert.throws(() => prepareShowsSync(archive([row(), row()]), baseline), /duplicate.*identity/i);
});

test('private evidence edits and excluded source row insertions are public no-ops', () => {
  const result = prepareShowsSync(archive([
    row('2020-01-01', 'Cancelled', '已取消'),
    row('2026-01-02', 'Venue', '[source][W1] · 活动公告；联系人与内部结算说明'),
  ]), baseline);
  assert.equal(result.changed, false);
  assert.deepEqual(result.shows, baseline);
  assert.doesNotMatch(result.serialized, /联系人|结算|Cancelled/);
});

test('year-prefixed research prose is not mistaken for a broken dated table row', () => {
  const result = prepareShowsSync(archive(['2010 年没有找到逐场记录。', row()]), baseline);
  assert.equal(result.changed, false);
});

test('valid status, reference URL, range and upcoming changes are public updates', () => {
  const changed = prepareShowsSync(archive(
    [row('2026-01-02', 'Venue', '[source][W1] · 本人确认出演')],
    ['| 2027-02-01 – 2027-02-03 | 新城市，中国 | 新场地 | Web DJ，19:00 | 本人确认未来行程 |'],
    '[W1]: https://example.com/corrected',
  ), baseline);
  assert.equal(changed.changed, true);
  const old = changed.shows.find(show => show.event === 'Venue');
  assert.equal(old.id, baseline[0].id);
  assert.equal(old.status, 'artist-confirmed');
  assert.equal(old.sources[0].url, 'https://example.com/corrected');
  assert.equal(changed.shows[0].endDate, '2027-02-03');
  assert.equal(changed.shows[0].status, 'upcoming');
  assert.equal(changed.shows[0].time, '19:00');
  assert.equal(changed.shows[0].event, '新场地');
});

for (const heading of ['逐场档案', '未能定位到单日的线索', '未来行程（Upcoming）', '来源索引']) {
  test(`missing required section ${heading} fails closed`, () => {
    assert.throws(() => prepareShowsSync(archive().replace(`## ${heading}`, '## Removed'), baseline), /section/i);
  });
}

for (const broken of [
  row().replace('| 2026', '|2026'),
  row().replace('| 2026', '|\t2026'),
  ` ${row()}`,
  row().slice(1),
  row().slice(0, -1),
  row().replace(' | Live', ''),
  row().replace(' | Live', ' | Extra | Live'),
  row().replace(' | City |', ' | |'),
  row().replace(' | Venue |', ' | |'),
  row().replace(' | Live |', ' | |'),
  row().replace('[source][W1] · 活动公告', ''),
  row().replace('2026-01-02', 'not-a-date'),
  '2026 01 02 City Venue Live source',
]) {
  test(`malformed table row fails closed: ${JSON.stringify(broken.slice(0, 55))}`, () => {
    assert.throws(() => prepareShowsSync(archive([row('2020-01-01', 'Keep'), broken]), baseline), /row|column|value|date/i);
  });
}

for (const date of ['2025-02-29', '2026-13-01', '2026-01-32', '2026-1-02',
  '2026-01-02 – 2026-01-01', '2026-01-02 – 2026-02-', '2026-01-02 –',
  '2026-01-02 至 2026-01-03 至 2026-01-04']) {
  test(`invalid date or range fails closed: ${date}`, () => {
    assert.throws(() => prepareShowsSync(archive([row(date)]), baseline), /date|range/i);
  });
}

test('valid leap dates and explicitly unknown formats are accepted', () => {
  const result = prepareShowsSync(archive([row('2024-02-29').replace('| Live |', '| 未注明 |')]), []);
  assert.equal(result.shows[0].performance, '');
});

test('truncated source definitions fail instead of silently losing public sources', () => {
  const source = archive([row(), row('2025-01-01', 'Other', '[second][C1]')], [],
    '[W1]: https://example.com/archive\n[C1]: https://example.com/other');
  assert.throws(() => prepareShowsSync(source.replace(/\n\[C1\]:[^\n]+/, ''), baseline), /reference/i);
  assert.throws(() => prepareShowsSync(archive([row()], [], ''), baseline), /reference/i);
});

test('a partially edited evidence reference cannot silently disappear from public sources', () => {
  assert.throws(() => prepareShowsSync(archive([row('2026-01-02', 'Venue', '[source][W1')]), baseline), /reference/i);
});

for (const url of ['javascript:alert(1)', 'file:///tmp/private', 'https://', 'https://example.com/ url']) {
  test(`invalid reference URL fails closed: ${url}`, () => {
    assert.throws(() => prepareShowsSync(archive([row()], [], `[W1]: ${url}`), baseline), /URL|reference/i);
  });
}

test('duplicate sections and ambiguous source definitions fail closed', () => {
  assert.throws(() => prepareShowsSync(archive() + '\n## 逐场档案\n', baseline), /section/i);
  assert.throws(() => prepareShowsSync(archive() + '\n[W1]: https://example.com/different\n', baseline), /reference/i);
});

test('empty output and record decreases above ten percent fail; an exact ten percent cancellation works', () => {
  assert.throws(() => prepareShowsSync(archive([], []), baseline), /empty/i);
  const lines = Array.from({ length: 10 }, (_, i) => row(`2026-01-${String(i + 1).padStart(2, '0')}`, `Venue ${i}`));
  const previous = prepareShowsSync(archive(lines), []).shows;
  assert.throws(() => prepareShowsSync(archive(lines.slice(2)), previous), /10%|decreas/i);
  const cancelled = [...lines];
  cancelled[0] = cancelled[0].replace('活动公告', '已取消');
  const result = prepareShowsSync(archive(cancelled), previous);
  assert.equal(result.shows.length, 9);
  assert.equal(result.changed, true);
});

test('tentative plans are omitted while explicitly upcoming appearances remain', () => {
  const result = prepareShowsSync(archive([
    row(), row('2025-01-01', 'Tentative', 'tentative，不能标作已完成'),
  ], [row('2027-01-01', 'Future', '本人确认未来行程')]), baseline);
  assert.deepEqual(result.shows.map(show => show.event), ['Future', 'Venue']);
});

test('unknown public fields and unsafe links in the existing snapshot fail closed', () => {
  assert.throws(() => prepareShowsSync(archive(), [{ ...baseline[0], privateNotes: 'private' }]), /field/i);
  assert.throws(() => prepareShowsSync(archive(), [{ ...baseline[0], sources: [{ label: 'W1', url: 'file:///private' }] }]), /URL|source/i);
});

test('reference snapshot remains structurally valid and no IDs change when imported from public records', () => {
  const reference = JSON.parse(readFileSync(new URL('./fixtures/shows-reference.json', import.meta.url)));
  const sourceRows = reference.map(show => {
    const date = show.date + (show.endDate ? ` 至 ${show.endDate}` : '') + (show.dateUncertain ? '（待核）' : '');
    const status = { 'artist-confirmed': '本人确认出演', documented: '现场留档', provisional: '本轮未核对' }[show.status] || '活动公告';
    return { upcoming: show.status === 'upcoming', line: `| ${date} | ${show.location} | ${show.event} | ${show.performance || '未注明'} | ${show.sources.map(source => `[source][${source.label}]`).join(' ')} ${status} |` };
  });
  const refs = new Map(reference.flatMap(show => show.sources).map(source => [source.label, source.url]));
  const result = prepareShowsSync(archive(sourceRows.filter(row => !row.upcoming).map(row => row.line),
    sourceRows.filter(row => row.upcoming).map(row => row.line),
    [...refs].map(([label, url]) => `[${label}]: ${url}`).join('\n')), reference);
  assert.equal(result.shows.length, 170);
  assert.deepEqual(result.shows, reference);
  assert.equal(result.changed, false);
});
