import test from 'node:test';
import assert from 'node:assert/strict';
import { localDateKey, showPhase } from '../src/content/show-phase.js';
import { createShowSearch } from '../src/content/show-search.js';

test('calendar keys use local dates, including just after midnight', () => {
  assert.equal(localDateKey(new Date(2026, 9, 6, 0, 1)), '2026-10-06');
  assert.equal(localDateKey(new Date(2026, 11, 31, 23, 59)), '2026-12-31');
});

test('same-day shows remain upcoming until the next local calendar day', () => {
  const show = { date: '2026-10-06' };
  assert.equal(showPhase(show, '2026-10-05'), 'upcoming');
  assert.equal(showPhase(show, '2026-10-06'), 'upcoming');
  assert.equal(showPhase(show, '2026-10-07'), 'past');
});

test('multi-day events remain upcoming through their inclusive end date', () => {
  const show = { date: '2025-10-22', endDate: '2025-10-25' };
  assert.equal(showPhase(show, '2025-10-23'), 'upcoming');
  assert.equal(showPhase(show, '2025-10-25'), 'upcoming');
  assert.equal(showPhase(show, '2025-10-26'), 'past');
});

test('date status does not inherit editorial confirmation or old upcoming flags', () => {
  assert.equal(showPhase({ date: '2026-10-06', status: 'upcoming' }, '2027-01-01'), 'past');
  assert.equal(showPhase({ date: '2026-10-06', status: 'provisional' }, '2026-09-01'), 'upcoming');
});

test('status searches reevaluate the current day without recreating the search index', () => {
  const rows = [
    { date: '2026-10-06', event: 'AIPPI', performance: 'Panel Speaker', location: 'Hamburg，德国', status: 'upcoming' },
    { date: '2026-09-26', event: '育音堂小镇 C厅', performance: 'Live Set', location: '上海，中国', status: 'upcoming' },
  ];
  const search = createShowSearch(rows);
  assert.deepEqual(search('upcoming', new Date(2026, 9, 6)), [rows[0]]);
  assert.deepEqual(search('past', new Date(2026, 9, 6)), [rows[1]]);
  assert.deepEqual(search('upcoming', new Date(2026, 9, 7)), []);
  assert.deepEqual(search('past', new Date(2026, 9, 7)), rows);
  assert.deepEqual(search('past Hamburg', new Date(2026, 9, 7)), [rows[0]]);
});
