import { getPressArchive } from '../content/press.js';
import '../styles/press-archive.css';

export function mountPressArchive() {
  const host = document.querySelector('[data-press-archive]');
  if (!host) return;
  const { featured, articles, appearances } = getPressArchive();

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function externalLink(item, className) {
    const link = element('a', className);
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  function year(item) {
    const date = element('time', '', item.published.slice(0, 4));
    date.dateTime = item.published;
    return date;
  }

  function arrow() {
    const node = element('span', 'press-arrow', '↗');
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function sourceList(items, label) {
    const list = element('ul', 'press-directory');
    list.setAttribute('aria-label', label);
    items.forEach(item => {
      const row = element('li');
      const link = externalLink(item, 'press-directory-link');
      link.dataset.pressId = item.id;
      link.append(
        element('span', 'press-outlet', item.publisher),
        element('h3', 'press-article-title', item.title),
        element('span', 'press-kind', item.kind),
        year(item),
        arrow()
      );
      row.append(link);
      list.append(row);
    });
    return list;
  }

  const heading = element('header', 'press-heading');
  heading.append(
    element('h2', 'press-heading-title', 'Selected Press'),
    element('p', 'press-heading-description', 'Interviews, profiles and reviews')
  );

  const feature = element('article', 'press-feature');
  feature.setAttribute('aria-labelledby', 'press-feature-title');
  const imageLink = externalLink(featured, 'press-feature-image');
  imageLink.setAttribute('aria-label', 'Read the Mixmag Asia interview');
  const image = element('img');
  image.src = featured.thumbnail.src;
  image.alt = featured.thumbnail.alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  imageLink.append(image);
  const featureCopy = element('div', 'press-feature-copy');
  const metadata = element('div', 'press-feature-meta');
  metadata.append(element('span', '', featured.publisher), year(featured));
  const title = element('h3', '', featured.title);
  title.id = 'press-feature-title';
  const action = externalLink(featured, 'press-read-link');
  action.append(element('span', '', 'Read the interview'), arrow());
  featureCopy.append(metadata, title, element('p', '', featured.description), action);
  feature.append(imageLink, featureCopy);

  const archiveHeading = element('div', 'press-directory-heading');
  const years = [featured, ...articles].map(item => Number(item.published.slice(0, 4)));
  archiveHeading.append(
    element('p', '', 'Press archive'),
    element('span', '', `${Math.max(...years)} — ${Math.min(...years)}`)
  );
  const archive = sourceList(articles, 'Selected editorial coverage');

  const records = element('details', 'press-appearances');
  const summary = element('summary', 'press-appearances-toggle');
  summary.append(
    element('span', '', 'Radio & Appearances'),
    element('span', 'press-appearances-caption', 'Broadcasts, exhibitions and performances')
  );
  records.append(summary, sourceList(appearances, 'Radio and institutional records'));
  host.replaceChildren(heading, feature, archiveHeading, archive, records);
}
