import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { projectDetails } from '../src/content/project-details.js';
import { pressItems } from '../src/content/press.js';
import { displayShow } from '../src/content/shows-display.js';
import { createSiteTranslator, musicZh } from '../src/content/site-translations.js';

const shows = JSON.parse(readFileSync(new URL('../src/content/shows.json', import.meta.url)));
const { translate } = createSiteTranslator({ shows, projectDetails, pressItems });

test('navigation and language-sensitive UI have Chinese equivalents', () => {
  for (const text of ['MUSIC', 'WEB-DJ', 'PROJECTS', 'ABOUT', 'SHOWS', 'PRESS', 'MERCH',
    'In development', 'Upcoming', 'Past', 'Close project details', 'Activate player controls']) {
    assert.match(translate(text), /[\u3400-\u9fff]/);
    assert.equal(translate(text, 'en'), text);
  }
});

test('translation preserves whitespace, unknown names, and original English', () => {
  assert.equal(translate('\n  Music  \n'), '\n  音乐  \n');
  assert.equal(translate('\n  Music  \n', 'en'), '\n  Music  \n');
  assert.equal(translate('Spotify'), 'Spotify');
  assert.equal(translate(''), '');
});

test('pagination, release metadata and accessible dynamic labels are translated', () => {
  assert.equal(translate('1–6 / 167 · Page 1 of 28'), '1–6 / 167 条 · 第 1 / 28 页');
  assert.equal(translate('2 / 2 · 7 sources'), '2 / 2 · 7 条来源');
  assert.equal(translate('SINGLE 2021'), '单曲 2021');
  assert.equal(translate('Loading Early Technologies...'), '正在加载《早期科技》…');
  assert.equal(translate('2023: Early Technologies'), '2023：早期科技');
  assert.equal(translate('Listen on NetEase Cloud Music (opens in a new tab)'), '在网易云音乐收听（在新标签页打开）');
});

test('every current project and press entry has translated prose and image labels', () => {
  for (const project of Object.values(projectDetails)) {
    for (const source of [project.summary, ...project.paragraphs, project.source.credit,
      ...[project.image, ...project.gallery].flatMap(image => [image.alt, image.caption])]) {
      assert.notEqual(translate(source), source, source);
      assert.equal(translate(source, 'en'), source);
    }
  }
  for (const item of pressItems) {
    for (const source of [item.title, item.description, item.thumbnail.alt, `${item.kind} / ${item.language}`]) {
      assert.notEqual(translate(source), source, item.id + ': ' + source);
      assert.ok(!translate(source).includes('undefined'));
    }
  }
});

test('all shows translate performance format and city while preserving proper venue names', () => {
  for (const show of shows) {
    const display = displayShow(show);
    assert.match(translate(display.title), /[\u3400-\u9fff]/, display.title);
    assert.match(translate(display.location), /[\u3400-\u9fff]/, display.location);
    assert.equal(translate(display.title, 'en'), display.title);
  }
});

test('all music releases have Chinese titles and descriptions', () => {
  assert.equal(Object.keys(musicZh).length, 5);
  assert.ok(musicZh['beng-di-zhi-da-bing']);
  for (const [id, [title, description]] of Object.entries(musicZh)) {
    const source = { id, titleEn: 'Title ' + id, description: 'Description ' + id };
    const translator = createSiteTranslator({ musicReleases: [source] });
    assert.equal(translator.translate(source.titleEn), title);
    assert.equal(translator.translate(source.description), description);
  }
});
