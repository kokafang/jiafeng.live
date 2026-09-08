import assert from 'node:assert/strict';
import test from 'node:test';
import {
  brushPoints, mistBrushOpacity, stampMistMask, fadeMistMask,
  recoveryAlpha, MIST_RETURN_DELAY, MIST_RECOVERY_END
} from '../src/scripts/project-mist-brush.js';

test('mist brush joins fast pointer movements without gaps', () => {
  const from = { x: 0, y: 10 };
  const to = { x: 180, y: 100 };
  const points = [from, ...brushPoints(from, to, 24)];
  assert.deepEqual(points.at(-1), to);
  for (let i = 1; i < points.length; i += 1) {
    assert.ok(Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y) <= 7.2);
  }
  assert.deepEqual(brushPoints(null, to, 24), [to]);
});

test('mist recovery is gradual and independent of frame rate', () => {
  assert.equal(recoveryAlpha(0), 0);
  assert.equal(recoveryAlpha(-1), 0);
  assert.ok(recoveryAlpha(1 / 30) < 0.05);
  assert.ok(Math.abs((1 - recoveryAlpha(1 / 30)) ** 30 - (1 - recoveryAlpha(1 / 60)) ** 60) < 0.00001);
});

test('wiped glass stays clear before condensation gradually returns', () => {
  assert.equal(recoveryAlpha(1 / 30, 1), 0);
  assert.equal(recoveryAlpha(1 / 30, MIST_RETURN_DELAY), 0);
  const justStarted = recoveryAlpha(1 / 30, MIST_RETURN_DELAY + 0.01);
  assert.ok(justStarted > 0);
  assert.ok(justStarted < recoveryAlpha(1 / 30));
  assert.ok(1 - recoveryAlpha(MIST_RECOVERY_END - MIST_RETURN_DELAY) < 0.002);
});

test('mist brush has a broad continuous feather rather than a solid disk', () => {
  assert.ok(mistBrushOpacity(0, 40) > 0.99);
  assert.ok(mistBrushOpacity(20, 40) < 0.4);
  assert.ok(mistBrushOpacity(30, 40) < 0.1);
  assert.equal(mistBrushOpacity(40, 40), 0);
  for (let i = 1; i <= 40; i++) {
    assert.ok(mistBrushOpacity(i, 40) <= mistBrushOpacity(i - 1, 40));
  }
});

test('overlapping pointer events never harden the feathered edge', () => {
  const coverage = new Float32Array(100 * 100);
  const point = { x: 50.5, y: 50.5 };
  stampMistMask(coverage, 100, 100, null, point, 40);
  const original = coverage.slice();
  for (let i = 0; i < 50; i++) stampMistMask(coverage, 100, 100, point, point, 40);
  assert.deepEqual(coverage, original);
  assert.ok(coverage[50 * 100 + 70] < 0.4);
});

test('continuous wiping is independent of event spacing and remains within the card', () => {
  const a = new Float32Array(100 * 100);
  const b = new Float32Array(100 * 100);
  stampMistMask(a, 100, 100, { x: 10, y: 50 }, { x: 90, y: 50 }, 30);
  for (let x = 10; x < 90; x += 10) {
    stampMistMask(b, 100, 100, { x, y: 50 }, { x: x + 10, y: 50 }, 30);
  }
  assert.deepEqual(a, b);
  assert.equal(a[0], 0);
  const before = a.slice();
  fadeMistMask(a, 0.5);
  assert.ok(a.every((value, index) => Math.abs(value - before[index] * 0.5) < 0.000001));
});
