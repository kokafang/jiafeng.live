import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const cards = [...html.matchAll(/<article class="merch-card"[^>]*>([\s\S]*?)<\/article>/g)].map(match => match[1]);

test('merch includes the dance pad and lyric T-shirt with local images and safe source links', () => {
  assert.equal(cards.length, 2);
  for (const card of cards) {
    const image = card.match(/<img src="([^"]+)" alt="([^"]+)"/);
    assert.ok(image?.[2]);
    assert.ok(existsSync(new URL('../public' + image[1], import.meta.url)));
    const link = card.match(/<a class="merch-source" href="([^"]+)"[^>]*>/);
    assert.equal(new URL(link[1]).protocol, 'https:');
    assert.match(link[0], /rel="noopener noreferrer"/);
  }
});

test('only the verified dance-pad stock label is displayed', () => {
  assert.match(cards[0], /Out of stock/);
  assert.match(cards[0], /jiafeng\.bandcamp\.com/);
  assert.match(cards[1], /Kenshiro Caravaggio Carena/);
  assert.match(cards[1], /xiaohongshu\.com\/explore\/668e7698000000000d00d59b"/);
  assert.doesNotMatch(cards[1], /merch-stock|xsec_token|Buy now/i);
});
