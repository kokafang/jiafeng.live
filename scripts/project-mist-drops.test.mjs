import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ASCII_DROP_GLYPHS, createAsciiDrops, releaseAsciiDrops, advanceAsciiDrops
} from '../src/scripts/project-mist-drops.js';
import { MIST_RETURN_DELAY } from '../src/scripts/project-mist-brush.js';

test('droplets use only ASCII glyphs and a stable per-card layout', () => {
  assert.ok(ASCII_DROP_GLYPHS.flat().every(line => /^[\x20-\x7e]+$/.test(line)));
  assert.deepEqual(createAsciiDrops(1), createAsciiDrops(1));
  assert.notDeepEqual(createAsciiDrops(1), createAsciiDrops(2));
  assert.ok(createAsciiDrops(1).every(drop => drop.x > 0 && drop.x < 1 && drop.y > 0 && drop.y < 1));
});

test('wiping releases only that card and repeated movement does not restart falling', () => {
  const first = createAsciiDrops(1);
  const second = createAsciiDrops(2);
  releaseAsciiDrops(first, 1);
  const times = first.map(drop => drop.fallAt);
  advanceAsciiDrops(first, 2, 1 / 30, true, 0);
  assert.ok(first.every(drop => drop.y > drop.homeY));
  releaseAsciiDrops(first, 2);
  assert.deepEqual(first.map(drop => drop.fallAt), times);
  assert.ok(second.every(drop => drop.phase === 'rest' && drop.y === drop.homeY));
});

test('falling is frame-rate independent and finishes below the thumbnail without wrapping', () => {
  const a = createAsciiDrops(1);
  const b = createAsciiDrops(1);
  releaseAsciiDrops(a, 0);
  releaseAsciiDrops(b, 0);
  for (let i = 1; i <= 15; i++) advanceAsciiDrops(a, i / 30, 1 / 30, true, 0);
  for (let i = 1; i <= 30; i++) advanceAsciiDrops(b, i / 60, 1 / 60, true, 0);
  assert.deepEqual(a.map(drop => drop.y), b.map(drop => drop.y));
  advanceAsciiDrops(a, 2, 1 / 30, true, 0);
  assert.ok(a.every(drop => drop.phase === 'empty' && drop.opacity === 0 && drop.y > 1));
});

test('ASCII condensation waits until after leaving and does not pop back at full opacity', () => {
  const drops = createAsciiDrops(1);
  releaseAsciiDrops(drops, 0);
  advanceAsciiDrops(drops, 20, 1 / 30, true, 0);
  advanceAsciiDrops(drops, 22, 1 / 30, true, 22);
  assert.ok(drops.every(drop => drop.phase === 'empty'));
  advanceAsciiDrops(drops, 22, 1 / 30, false, MIST_RETURN_DELAY);
  assert.ok(drops.every(drop => drop.phase === 'empty'));
  advanceAsciiDrops(drops, 23, 1 / 30, false, MIST_RETURN_DELAY + 1);
  advanceAsciiDrops(drops, 23.1, 0.1, false, MIST_RETURN_DELAY + 1.1);
  assert.ok(drops.every(drop => drop.phase === 'condensing' && drop.opacity > 0 && drop.opacity < 0.1));
  const previousY = drops.map(drop => drop.y);
  releaseAsciiDrops(drops, 23.1);
  assert.deepEqual(drops.map(drop => drop.y), previousY);
});
