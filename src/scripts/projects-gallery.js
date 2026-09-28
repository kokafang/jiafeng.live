import { projectGallery } from '../content/project-gallery.js';
import { createProjectRotation } from './project-rotation.js';
import '../styles/projects-gallery.css';

export function mountProjectsGallery() {
  const host = document.querySelector('#products [data-projects-gallery]');
  if (!host || !projectGallery.length) return { setPaused() {} };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const listen = (node, event, handler) => node.addEventListener(event, handler, { signal: events.signal });
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const stage = element('div', 'project-feature');
  stage.id = 'project-feature';
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-roledescription', 'carousel');
  stage.setAttribute('aria-label', 'Selected projects');
  const figure = element('figure', 'project-feature-art');
  const image = element('img');
  image.decoding = 'async';
  const caption = element('figcaption', 'project-feature-caption');
  const captionText = element('span');
  const count = element('span', 'project-feature-count');
  caption.append(captionText, count);
  figure.append(image, caption);
  const copy = element('div', 'project-feature-copy');
  const date = element('div', 'project-feature-date');
  const year = element('span', 'project-feature-year');
  const yearNote = element('span', 'project-feature-year-note');
  date.append(year, yearNote);
  const title = element('h3', 'project-feature-title');
  const titleZh = element('p', 'project-feature-title-zh');
  titleZh.lang = 'zh-CN';
  title.dataset.noTranslate = '';
  const category = element('p', 'project-feature-category');
  const summary = element('p', 'project-feature-summary');
  const detail = element('button', 'collection-action', 'Explore project');
  detail.type = 'button';
  const arrow = element('span', '', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  detail.append(arrow);
  copy.append(date, title, titleZh, category, summary, detail);
  stage.append(figure, copy);
  const controls = element('div', 'project-index-bar');
  const index = element('div', 'project-index');
  index.setAttribute('role', 'group');
  index.setAttribute('aria-label', 'Choose a project');
  const buttons = projectGallery.map((project, number) => {
    const button = element('button', 'project-index-item');
    button.type = 'button';
    button.dataset.projectIndex = String(number);
    button.setAttribute('aria-controls', stage.id);
    const meta = element('span', 'project-index-meta');
    meta.append(element('span', '', String(number + 1).padStart(2, '0')), element('span', '', project.year));
    if (project.yearNote) meta.append(element('span', 'project-index-year-note', project.yearNote));
    const name = element('span', 'project-index-name', project.title);
    button.append(meta, name);
    button.addEventListener('click', event => {
      rotation.select(number);
      updateRotation();
      if (event.detail > 0 && matchMedia('(max-width: 900px)').matches && stage.getBoundingClientRect().top < 80) {
        stage.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      }
    });
    index.append(button);
    return button;
  });
  const playback = element('div', 'project-playback');
  const intervalLabel = element('span', 'project-interval', '5 sec / project');
  const pauseButton = element('button', 'project-pause');
  pauseButton.type = 'button';
  const pauseSymbol = element('span', 'project-pause-symbol');
  pauseSymbol.setAttribute('aria-hidden', 'true');
  const pauseText = element('span');
  pauseButton.append(pauseSymbol, pauseText);
  playback.append(intervalLabel, pauseButton);
  controls.append(index, playback);
  const announcement = element('span', 'project-announcement');
  announcement.setAttribute('aria-live', 'polite');
  host.replaceChildren(stage, controls, announcement);
  let userPaused = false;
  let motionPaused = reducedMotion.matches;
  let motionAnimation;

  function render(number, { automatic = false } = {}) {
    const project = projectGallery[number];
    stage.dataset.projectId = project.id;
    image.src = project.image.src;
    image.alt = project.image.alt;
    image.style.objectPosition = project.image.position || 'center';
    captionText.textContent = project.image.caption;
    count.textContent = `${String(number + 1).padStart(2, '0')} / ${String(projectGallery.length).padStart(2, '0')}`;
    year.textContent = project.year;
    yearNote.textContent = project.yearNote || '';
    yearNote.hidden = !project.yearNote;
    title.textContent = project.title;
    titleZh.textContent = project.titleZh;
    category.textContent = project.category;
    summary.textContent = project.summary;
    detail.dataset.projectDetail = project.id;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === number)));
    if (!automatic) announcement.textContent = project.title;
    motionAnimation?.cancel();
    if (!reducedMotion.matches && stage.animate) {
      motionAnimation = stage.animate([{ opacity: 0.65 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
    }
    const nextImage = new Image();
    nextImage.src = projectGallery[(number + 1) % projectGallery.length].image.src;
  }
  const rotation = createProjectRotation({ count: projectGallery.length, interval: 5000, onChange: render });
  function updateRotation() {
    const stopped = userPaused || motionPaused;
    pauseSymbol.textContent = stopped ? '▷' : 'Ⅱ';
    pauseText.textContent = stopped ? 'Resume slideshow' : 'Pause slideshow';
    pauseButton.setAttribute('aria-label', stopped ? 'Resume project slideshow' : 'Pause project slideshow');
    pauseButton.setAttribute('aria-pressed', String(stopped));
    host.dataset.rotationRunning = String(rotation.getState().running);
  }
  function setPaused(reason, paused) {
    rotation.setPaused(reason, paused);
    updateRotation();
  }
  pauseButton.addEventListener('click', () => {
    if (userPaused || motionPaused) { userPaused = false; motionPaused = false; }
    else userPaused = true;
    rotation.setPaused('user', userPaused);
    rotation.setPaused('reduced-motion', motionPaused);
    updateRotation();
  });
  const visibility = new IntersectionObserver(([entry]) => {
    // A phone in landscape can show less than a third of this tall feature.
    const readingHeight = Math.min(entry.boundingClientRect.height, entry.rootBounds?.height || innerHeight);
    rotation.setActive(entry.isIntersecting && entry.intersectionRect.height >= readingHeight * 0.5);
    updateRotation();
  }, { threshold: Array.from({ length: 21 }, (_, index) => index / 20), rootMargin: '-80px 0px -20px 0px' });
  visibility.observe(stage);
  listen(document, 'visibilitychange', () => setPaused('document', document.hidden));
  listen(reducedMotion, 'change', () => {
    motionPaused = reducedMotion.matches;
    setPaused('reduced-motion', motionPaused);
  });
  const syncFocus = () => {
    const focused = document.activeElement;
    setPaused('keyboard', host.contains(focused) && focused.matches(':focus-visible') && focused !== pauseButton);
  };
  listen(host, 'focusin', syncFocus);
  listen(host, 'focusout', () => queueMicrotask(syncFocus));
  // A pointer-focused control can become keyboard-focused without a focus event.
  listen(host, 'keydown', event => {
    if (event.target !== pauseButton && !pauseButton.contains(event.target)) setPaused('keyboard', true);
  });
  listen(host, 'pointerdown', () => setPaused('keyboard', false));
  listen(window, 'pagehide', () => setPaused('page', true));
  listen(window, 'pageshow', () => setPaused('page', false));
  rotation.setPaused('document', document.hidden);
  rotation.setPaused('reduced-motion', motionPaused);
  render(0, { automatic: true });
  updateRotation();
  if (import.meta.hot) import.meta.hot.dispose(() => {
    rotation.destroy(); visibility.disconnect(); events.abort(); motionAnimation?.cancel();
  });
  return { setPaused };
}
