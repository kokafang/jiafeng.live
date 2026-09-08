import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { projectDetails } from '../src/content/project-details.js';

test('project introductions have readable copy and existing local artwork', () => {
  for (const [id, project] of Object.entries(projectDetails)) {
    assert.match(id, /^[a-z0-9-]+$/);
    for (const key of ['title', 'titleZh', 'category', 'status', 'summary']) {
      assert.ok(project[key]?.trim(), id + ': ' + key);
    }
    assert.ok(project.paragraphs.length >= 2);
    assert.ok(project.paragraphs.every(paragraph => paragraph.trim().length > 0));
    assert.ok(project.facts.every(fact => fact.label && fact.value));
    for (const image of [project.image, ...(project.gallery || [])]) {
      assert.match(image.src, /^\/images\/[^/]+\.(svg|jpg|jpeg|png|webp)$/);
      assert.ok(existsSync(new URL('../public' + image.src, import.meta.url)));
      assert.ok(image.alt);
      assert.ok(image.caption);
      if (image.overlay) {
        assert.match(image.overlay.src, /^\/images\/[^/]+\.(svg|jpg|jpeg|png|webp)$/);
        assert.ok(existsSync(new URL('../public' + image.overlay.src, import.meta.url)));
        assert.ok(image.overlay.alt);
      }
    }
    if (project.source) {
      assert.equal(new URL(project.source.href).protocol, 'https:');
      assert.ok(project.source.label);
      assert.ok(project.source.credit);
      for (const reference of project.source.references || []) {
        assert.equal(new URL(reference.href).protocol, 'https:');
        assert.ok(reference.label);
      }
    }
    if (project.listen) {
      assert.equal(new URL(project.listen.href).protocol, 'https:');
      for (const key of ['title', 'label', 'credit']) assert.ok(project.listen[key]?.trim());
    }
  }
});

test('Ting Difang uses three locally hosted source images with a public attribution link', () => {
  const project = projectDetails['ting-difang'];
  assert.equal(project.gallery.length, 2);
  assert.match(project.image.src, /ting-difang-treehouse\.webp$/);
  assert.equal(new URL(project.source.href).search, '');
  assert.doesNotMatch(project.status, /prototype/i);
});

test('Ting Difang foregrounds dialect in its card and project introduction', () => {
  const project = projectDetails['ting-difang'];
  assert.match(project.title, /Dialect/);
  assert.match(project.category, /Dialect/);
  assert.match(project.summary, /local dialects/);
  assert.match(project.paragraphs[0], /begins with dialect/);
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<strong>Ting Difang: Dialect &amp; Sound/);
});

test('project thumbnails retain a real dance photo and the original Bach sprite', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /class="da-wo-dance-thumbnail" src="\/images\/da-wo-xian-ren-dance.webp"/);
  assert.match(html, /\/images\/bach-typewriter-sprites.webp/);
  const css = readFileSync(new URL('../src/styles/projects-gallery.css', import.meta.url), 'utf8');
  assert.match(css, /\/images\/bach-windows-score-background.jpg/);
  assert.ok(existsSync(new URL('../public/images/bach-windows-score-background.jpg', import.meta.url)));
});

test('every project dialog button maps to a reusable content record', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/<button\b[^>]*data-project-detail="([^"]+)"/g)].map(match => match[1]);
  for (const id of [
    'fakebook',
    'emotional-dance-music-kit',
    'bach-typewriter',
    'ting-difang',
    'da-wo-xian-ren'
  ]) assert.ok(ids.includes(id), id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(projectDetails[id], id);
});

test('new instrument popups use the intended public destinations', () => {
  const fakebook = projectDetails.fakebook;
  assert.equal(fakebook.source.href, 'https://fakebook.vercel.app');
  assert.equal(fakebook.source.references[0].href, 'https://github.com/kokafang/fakebook');

  const bach = projectDetails['bach-typewriter'];
  assert.equal(bach.source.href, 'https://github.com/kokafang/bach-typewriter');
  assert.equal(bach.facts.find(fact => fact.label === 'Output').value, 'Original Bach compositions, typed note by note');
  assert.match(bach.image.overlay.src, /bach-typewriter-sprites\.webp$/);

  const danceKit = projectDetails['emotional-dance-music-kit'];
  assert.equal(danceKit.listen.href, 'https://jiafeng.bandcamp.com/album/emotional-dance-music');
  assert.match(danceKit.source.href, /jiafeng\.bandcamp\.com\/merch\//);

  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /<a[^>]+href="https:\/\/fakebook\.vercel\.app"[^>]+class="project-link-card"/);
});

test('Da Wo Xian Ren credits the full production music and links to the supplied release', () => {
  const project = projectDetails['da-wo-xian-ren'];
  assert.match(project.summary, /entire performance by Jiafeng/);
  assert.equal(project.gallery.length, 2);
  const url = new URL(project.listen.href);
  assert.equal(url.hostname, 'music.163.com');
  assert.equal(url.pathname, '/album');
  assert.equal(url.searchParams.get('id'), '359619394');
  assert.equal(url.searchParams.has('userid'), false);
  assert.equal(new URL(project.source.href).search, '');
});
