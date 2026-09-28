import assert from 'node:assert/strict';
import test from 'node:test';
import { createProjectRotation } from '../src/scripts/project-rotation.js';

function fixture(t, options = {}) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const changes = [];
  const rotation = createProjectRotation({
    count: 3,
    onChange: (index, detail) => changes.push({ index, ...detail }),
    ...options,
  });
  t.after(() => rotation.destroy());
  return { rotation, changes, tick: (ms) => t.mock.timers.tick(ms) };
}

test('only advances while active, waits five seconds, and wraps to the first project', (t) => {
  const { rotation, changes, tick } = fixture(t);
  assert.deepEqual(rotation.getState(), { index: 0, active: false, paused: false, running: false });
  tick(20000);
  assert.deepEqual(changes, []);

  rotation.setActive(true);
  tick(4999);
  assert.deepEqual(changes, []);
  tick(1);
  tick(5000);
  tick(5000);
  assert.deepEqual(changes, [
    { index: 1, automatic: true },
    { index: 2, automatic: true },
    { index: 0, automatic: true },
  ]);
  assert.deepEqual(rotation.getState(), { index: 0, active: true, paused: false, running: true });
});

test('repeated activation or unchanged pause state does not postpone the next project', (t) => {
  const { rotation, changes, tick } = fixture(t);
  rotation.setActive(true);
  tick(3000);
  rotation.setActive(true);
  rotation.setPaused('dialog', false);
  tick(2000);
  assert.deepEqual(changes, [{ index: 1, automatic: true }]);
});

test('manual selection gives the selected project a full interval, including reselection', (t) => {
  const { rotation, changes, tick } = fixture(t);
  rotation.setActive(true);
  tick(4000);
  rotation.select(2);
  tick(4000);
  rotation.select(2);
  tick(4999);
  assert.deepEqual(changes, [
    { index: 2, automatic: false },
    { index: 2, automatic: false },
  ]);
  tick(1);
  assert.deepEqual(changes.at(-1), { index: 0, automatic: true });
});

test('independent pause reasons cannot resume each other and resume starts a full interval', (t) => {
  const { rotation, changes, tick } = fixture(t);
  rotation.setActive(true);
  tick(4000);
  rotation.setPaused('hidden', true);
  rotation.setPaused('user', true);
  rotation.setPaused('hidden', true);
  rotation.setPaused('hidden', false);
  assert.deepEqual(rotation.getState(), { index: 0, active: true, paused: true, running: false });
  tick(30000);
  assert.deepEqual(changes, []);
  rotation.setPaused('user', false);
  tick(4999);
  assert.deepEqual(changes, []);
  tick(1);
  assert.deepEqual(changes, [{ index: 1, automatic: true }]);
});

test('leaving the section cancels pending movement with no catch-up when returning', (t) => {
  const { rotation, changes, tick } = fixture(t);
  rotation.setActive(true);
  tick(4000);
  rotation.setActive(false);
  tick(60000);
  assert.deepEqual(changes, []);
  rotation.setActive(true);
  tick(4999);
  assert.deepEqual(changes, []);
  tick(1);
  assert.deepEqual(changes, [{ index: 1, automatic: true }]);
});

test('manual selection while paused changes the project without restarting playback', (t) => {
  const { rotation, changes, tick } = fixture(t);
  rotation.setActive(true);
  rotation.setPaused('keyboard', true);
  rotation.select(2);
  tick(10000);
  assert.deepEqual(changes, [{ index: 2, automatic: false }]);
  assert.equal(rotation.getState().running, false);
});

test('destroy cancels the pending change and prevents future activation', (t) => {
  const { rotation, changes, tick } = fixture(t);
  rotation.setActive(true);
  tick(4999);
  rotation.destroy();
  rotation.setActive(true);
  rotation.setPaused('user', false);
  rotation.select(2);
  tick(20000);
  assert.deepEqual(changes, []);
  assert.equal(rotation.getState().running, false);
});

test('invalid selections leave the current project and deadline intact', (t) => {
  const { rotation, changes, tick } = fixture(t);
  rotation.setActive(true);
  tick(4000);
  for (const index of [-1, 3, 0.5, NaN, Infinity, '1']) rotation.select(index);
  assert.deepEqual(changes, []);
  tick(1000);
  assert.deepEqual(changes, [{ index: 1, automatic: true }]);
});

test('supports a configured interval', (t) => {
  const { rotation, changes, tick } = fixture(t, { interval: 4500 });
  rotation.setActive(true);
  tick(4499);
  assert.deepEqual(changes, []);
  tick(1);
  assert.deepEqual(changes, [{ index: 1, automatic: true }]);
});

test('invalid configuration fails before starting a timer', () => {
  for (const count of [0, -1, 1.5, NaN, Infinity, '3']) {
    assert.throws(() => createProjectRotation({ count, onChange() {} }), RangeError);
  }
  for (const interval of [0, -5, Infinity, NaN]) {
    assert.throws(() => createProjectRotation({ count: 3, onChange() {}, interval }), RangeError);
  }
  assert.throws(() => createProjectRotation({ count: 3 }), TypeError);
});
