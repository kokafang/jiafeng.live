import assert from 'node:assert/strict';
import test from 'node:test';
import { createProjectTransition } from '../src/scripts/project-transition.js';

function fixture() {
  let reduced = false;
  let visible;
  const animations = [];
  const stage = {
    ownerDocument: { defaultView: { getComputedStyle: () => ({ opacity: '0.4' }) } },
    animate() {
      let resolve;
      let reject;
      const finished = new Promise((yes, no) => { resolve = yes; reject = no; });
      const animation = { finished, finish: resolve, cancel: () => reject(new DOMException('Cancelled', 'AbortError')) };
      animations.push(animation);
      return animation;
    }
  };
  const transition = createProjectTransition({ stage, render: value => { visible = value; }, reducedMotion: () => reduced });
  return { transition, animations, visible: () => visible, reduce: () => { reduced = true; } };
}

test('initial content is immediate; replacement waits for fade-out, then becomes readable during fade-in', async () => {
  const { transition, animations, visible } = fixture();
  await transition.show('first');
  assert.equal(visible(), 'first');
  const changing = transition.show('second');
  assert.equal(visible(), 'first');
  animations[0].finish();
  await Promise.resolve();
  assert.equal(visible(), 'second');
  animations[1].finish();
  await changing;
  assert.equal(visible(), 'second');
});

test('rapid selection never commits the cancelled project after a newer selection', async () => {
  const { transition, animations, visible } = fixture();
  await transition.show('first');
  const outdated = transition.show('second');
  const latest = transition.show('third');
  animations[0].finish();
  await outdated;
  assert.equal(visible(), 'first');
  animations[1].finish();
  await Promise.resolve();
  assert.equal(visible(), 'third');
  animations[2].finish();
  await latest;
  assert.equal(visible(), 'third');
});

test('enabling reduced motion during a transition reveals the latest request immediately', async () => {
  const { transition, animations, visible, reduce } = fixture();
  await transition.show('first');
  const changing = transition.show('second');
  reduce();
  transition.finish();
  assert.equal(visible(), 'second');
  await changing;
  await transition.show('third');
  assert.equal(visible(), 'third');
  animations[0].finish();
  assert.equal(visible(), 'third');
});

test('destroying a fading gallery prevents delayed content writes', async () => {
  const { transition, animations, visible } = fixture();
  await transition.show('first');
  const changing = transition.show('second');
  transition.destroy();
  animations[0].finish();
  await changing;
  await transition.show('third');
  assert.equal(visible(), 'first');
});
