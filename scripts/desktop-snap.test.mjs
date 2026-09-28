import assert from 'node:assert/strict';
import test from 'node:test';
import { createDesktopSnap } from '../src/scripts/desktop-snap.js';

function fixture(t, heights = [800, 1600, 800]) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let y = 0;
  let now = 0;
  let enabled = true;
  const listeners = new Map();
  const scrolls = [];
  class Element {
    parentElement = null;
    overflowY = 'visible';
    closest() { return null; }
    matches() { return false; }
  }
  const body = new Element();
  const globals = {
    Element,
    innerHeight: 800,
    document: { body, documentElement: { scrollHeight: heights.reduce((sum, height) => sum + height, 0) } },
    window: {
      addEventListener(type, listener) {
        if (!listeners.has(type)) listeners.set(type, []);
        listeners.get(type).push(listener);
      },
      scrollTo({ top }) { y = top; scrolls.push(top); },
    },
    getComputedStyle: (node) => ({ overflowY: node.overflowY }),
  };
  const descriptors = new Map();
  for (const [key, value] of Object.entries(globals)) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  descriptors.set('scrollY', Object.getOwnPropertyDescriptor(globalThis, 'scrollY'));
  Object.defineProperty(globalThis, 'scrollY', { configurable: true, get: () => y });
  t.mock.method(performance, 'now', () => now);
  let top = 0;
  const sections = heights.map(height => {
    const sectionTop = top;
    top += height;
    return { getBoundingClientRect: () => ({ top: sectionTop - y, bottom: sectionTop + height - y, height }) };
  });
  const snap = createDesktopSnap({ sections, enabled: () => enabled, reducedMotion: { matches: true } });
  t.after(() => {
    snap.cancel();
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  function emit(type, values = {}) {
    const event = {
      target: body, cancelable: true, defaultPrevented: false, deltaX: 0, deltaY: 120, deltaMode: 0,
      preventDefault() { this.defaultPrevented = true; },
      ...values,
    };
    for (const listener of listeners.get(type) || []) listener(event);
    return event;
  }
  return {
    snap, emit, scrolls, body, Element,
    get y() { return y; },
    setY(value) { y = value; },
    setEnabled(value) { enabled = value; },
    tick(ms) { now += ms; t.mock.timers.tick(ms); },
  };
}

test('wheel reads a tall section naturally from its top and in both directions inside it', (t) => {
  const page = fixture(t);
  page.setY(800);
  assert.equal(page.emit('wheel').defaultPrevented, false);
  page.setY(1200);
  assert.equal(page.emit('wheel').defaultPrevented, false);
  assert.equal(page.emit('wheel', { deltaY: -120 }).defaultPrevented, false);
  page.setY(1600);
  assert.equal(page.emit('wheel', { deltaY: -120 }).defaultPrevented, false);
  assert.deepEqual(page.scrolls, []);
});

test('scroll settling and scrollbar release leave the long-section reading position intact', (t) => {
  const page = fixture(t);
  page.setY(1250);
  page.emit('scrollend');
  page.emit('scroll');
  page.tick(200);
  page.emit('pointerdown');
  page.emit('pointerup');
  page.emit('resize');
  page.tick(200);
  page.emit('blur');
  assert.equal(page.y, 1250);
  assert.deepEqual(page.scrolls, []);
});

test('directional keys use native reading within a tall section', (t) => {
  const page = fixture(t);
  for (const [y, key, shiftKey] of [
    [800, 'ArrowDown', false], [800, 'PageDown', false], [800, ' ', false],
    [1200, 'ArrowUp', false], [1200, 'PageUp', false], [1200, ' ', true],
    [1600, 'ArrowUp', false],
  ]) {
    page.setY(y);
    assert.equal(page.emit('keydown', { key, shiftKey }).defaultPrevented, false, `${key} at ${y}`);
  }
  assert.deepEqual(page.scrolls, []);
});

test('gestures at the reading edges move to the adjacent section and back to its bottom', (t) => {
  const page = fixture(t);
  page.setY(1500);
  assert.equal(page.emit('wheel').defaultPrevented, false);
  page.setY(1600);
  page.tick(200);
  assert.equal(page.emit('wheel').defaultPrevented, true);
  assert.equal(page.y, 2400);
  page.tick(200);
  assert.equal(page.emit('wheel', { deltaY: -120 }).defaultPrevented, true);
  assert.equal(page.y, 1600);
  page.tick(200);
  page.setY(800);
  assert.equal(page.emit('wheel', { deltaY: -120 }).defaultPrevented, true);
  assert.equal(page.y, 0);
});

test('keyboard snap from the following section lands on the tall section bottom', (t) => {
  const page = fixture(t);
  page.setY(2400);
  assert.equal(page.emit('keydown', { key: 'PageUp' }).defaultPrevented, true);
  assert.equal(page.y, 1600);
  page.setY(1600);
  assert.equal(page.emit('keydown', { key: 'ArrowDown' }).defaultPrevented, true);
  assert.equal(page.y, 2400);
});

test('short sections keep snapping and a swipe tail does not immediately scroll the next long section', (t) => {
  const page = fixture(t);
  assert.equal(page.emit('wheel').defaultPrevented, true);
  assert.equal(page.y, 800);
  page.tick(20);
  assert.equal(page.emit('wheel', { deltaY: 20 }).defaultPrevented, true);
  assert.equal(page.y, 800);
  page.tick(200);
  assert.equal(page.emit('wheel').defaultPrevented, false);
});

test('overshooting the reading range settles at the bottom rather than back at the heading', (t) => {
  const page = fixture(t);
  page.setY(1800);
  page.emit('scrollend');
  assert.equal(page.y, 1600);
});

test('explicit navigation still honors its exact destination and Home/End reach document edges', (t) => {
  const page = fixture(t);
  page.snap.goTo(1200);
  assert.equal(page.y, 1200);
  page.emit('keydown', { key: 'Home' });
  assert.equal(page.y, 0);
  page.emit('keydown', { key: 'End' });
  assert.equal(page.y, 2400);
});

test('Space on a focused disclosure summary keeps its native toggle at the section edge', (t) => {
  const page = fixture(t);
  page.setY(1600);
  const summary = new page.Element();
  summary.parentElement = page.body;
  summary.closest = selector => selector.split(',').some(part => part.trim() === 'summary') ? summary : null;
  assert.equal(page.emit('keydown', { target: summary, key: ' ' }).defaultPrevented, false);
  assert.deepEqual(page.scrolls, []);
});

test('disabled snap and nested descriptions preserve their existing input guards', (t) => {
  const page = fixture(t);
  page.setEnabled(false);
  assert.equal(page.emit('wheel').defaultPrevented, false);
  assert.equal(page.emit('keydown', { key: 'PageDown' }).defaultPrevented, false);
  page.setEnabled(true);
  page.setY(1200);
  const description = new page.Element();
  Object.assign(description, {
    parentElement: page.body, overflowY: 'auto', scrollHeight: 600, clientHeight: 200, scrollTop: 100,
  });
  assert.equal(page.emit('wheel', { target: description }).defaultPrevented, false);
  description.scrollTop = 400;
  assert.equal(page.emit('wheel', { target: description }).defaultPrevented, true);
  assert.equal(page.emit('keydown', { target: description, key: 'PageDown' }).defaultPrevented, false);
  assert.deepEqual(page.scrolls, []);
});
