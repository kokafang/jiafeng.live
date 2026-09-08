import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { getPressPage, pressCategories, pressItems } from '../src/content/press.js';

test('press records have unique identifiers and explicit external sources', () => {
  assert.equal(new Set(pressItems.map(item => item.id)).size, pressItems.length);
  for (const item of pressItems) {
    assert.ok(pressCategories.some(category => category.id === item.category));
    assert.equal(new URL(item.url).protocol, 'https:');
    for (const field of ['title', 'description', 'publisher', 'kind', 'language']) assert.ok(item[field]);
    assert.match(item.published, /^\d{4}(-\d{2}-\d{2})?$/);
  }
});

test('every press record has a local thumbnail and descriptive alternative text', () => {
  for (const item of pressItems) {
    assert.match(item.thumbnail.src, /^\/images\/[^/]+\.(jpg|jpeg|png|webp)$/);
    assert.ok(item.thumbnail.alt.length > 10);
    assert.ok(existsSync(new URL(`../public${item.thumbnail.src}`, import.meta.url)), item.id);
  }
});

test('four cards per page without duplicated or missing sources', () => {
  const first = getPressPage();
  assert.equal(first.items.length, 4);
  const all = Array.from({ length: first.pageCount }, (_, page) => getPressPage('all', page).items).flat();
  assert.deepEqual(all, pressItems);
  assert.equal(getPressPage('all', -1).page, 0);
  assert.equal(getPressPage('all', 99).page, first.pageCount - 1);
});

test('category filters contain only populated press and institution categories', () => {
  for (const category of pressCategories.filter(item => item.id !== 'all')) {
    const result = getPressPage(category.id);
    assert.ok(result.total > 0);
    assert.ok(result.items.every(item => item.category === category.id));
  }
  assert.ok(!pressItems.some(item => item.id === 'rym-community-snapshot'));
  assert.ok(!pressCategories.some(category => category.id === 'archive'));
  assert.equal(getPressPage('unknown').total, 0);
});
