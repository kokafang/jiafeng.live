import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/scripts/concept-artist-portal.js', import.meta.url), 'utf8');

test('AVS is the production-safe static project card', () => {
  const card = html.match(/<div class="fill-block sampler-project"[^>]*>[\s\S]*?<\/div>\s*<div class="fill-block media-block">/)?.[0];
  assert.ok(card, 'expected the AVS project card');
  assert.match(card, /data-avs-project/);
  assert.match(card, /AVS Sampler/);
  assert.match(card, /A performance sampler for mixing, chopping, and sequencing audiovisual clips live\./);
  assert.doesNotMatch(card, /<a\b|localhost:3000/);
});

test('the local AVS destination is mounted only behind Vite development mode', () => {
  assert.match(main, /if \(import\.meta\.env\.DEV\)/);
  assert.match(main, /mountAvsProjectLink/);
  assert.match(main, /http:\/\/localhost:3000/);
});
