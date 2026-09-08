import { projectDetails } from '../content/project-details.js';
import '../styles/project-dialog.css';

export function mountProjectDialog({ onOpen = () => {}, onClose = () => {} } = {}) {
  const triggers = [...document.querySelectorAll('[data-project-detail]')]
    .filter(trigger => projectDetails[trigger.dataset.projectDetail]);
  if (!triggers.length) return { isOpen: () => false };

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  const dialog = element('dialog', 'project-dialog');
  dialog.id = 'project-details-dialog';
  dialog.setAttribute('aria-labelledby', 'project-dialog-title');
  dialog.setAttribute('aria-describedby', 'project-dialog-summary');
  const header = element('div', 'project-dialog-header');
  const label = element('span', 'project-dialog-label', 'Project notes');
  const closeButton = element('button', 'project-dialog-close', '\u00d7');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close project details');
  closeButton.autofocus = true;
  header.append(label, closeButton);
  const scroll = element('div', 'project-dialog-scroll');
  scroll.tabIndex = 0;
  scroll.setAttribute('role', 'region');
  scroll.setAttribute('aria-label', 'Project introduction');
  dialog.append(header, scroll);
  document.body.append(dialog);

  let opener = null;
  let saved = null;
  let outsidePointerDown = false;

  function fill(project) {
    const layout = element('div', 'project-dialog-layout');
    const aside = element('aside', 'project-dialog-aside');
    const figure = element('figure', 'project-dialog-figure');
    const image = element('img');
    image.src = project.image.src;
    image.alt = project.image.alt;
    image.decoding = 'async';
    const caption = element('figcaption', '', project.image.caption);
    caption.setAttribute('aria-live', 'polite');
    figure.append(image, caption);
    aside.append(figure);
    if (project.gallery?.length) {
      figure.classList.add('project-dialog-figure--gallery');
      const gallery = element('div', 'project-dialog-gallery');
      gallery.setAttribute('role', 'group');
      gallery.setAttribute('aria-label', 'Project images');
      const pictures = [project.image, ...project.gallery];
      pictures.forEach((picture, index) => {
        const button = element('button', 'project-dialog-thumbnail');
        button.type = 'button';
        button.setAttribute('aria-label', 'Show image ' + (index + 1) + ': ' + picture.caption);
        button.setAttribute('aria-pressed', String(index === 0));
        const thumbnail = element('img');
        thumbnail.src = picture.src;
        thumbnail.alt = '';
        thumbnail.decoding = 'async';
        button.append(thumbnail);
        button.addEventListener('click', () => {
          image.src = picture.src;
          image.alt = picture.alt;
          caption.textContent = picture.caption;
          [...gallery.children].forEach(item => item.setAttribute('aria-pressed', String(item === button)));
          const offset = figure.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
          if (offset < 0) {
            scroll.scrollBy({
              top: offset - 16,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
            });
          }
        });
        gallery.append(button);
      });
      aside.append(gallery);
    }
    const facts = element('dl', 'project-dialog-facts');
    project.facts.forEach(fact => {
      const row = element('div');
      row.append(element('dt', '', fact.label), element('dd', '', fact.value));
      facts.append(row);
    });
    aside.append(facts);

    const copy = element('article', 'project-dialog-copy');
    copy.append(element('p', 'project-dialog-category', project.category + ' / ' + project.status));
    const title = element('h2', 'project-dialog-title', project.title);
    title.id = 'project-dialog-title';
    const titleZh = element('span', '', project.titleZh);
    titleZh.lang = 'zh-CN';
    title.append(titleZh);
    const summary = element('p', 'project-dialog-summary', project.summary);
    summary.id = 'project-dialog-summary';
    copy.append(title, summary);
    if (project.listen) {
      const listen = element('section', 'project-dialog-listen');
      listen.setAttribute('aria-label', 'Project soundtrack');
      listen.append(element('h3', '', project.listen.title), element('p', '', project.listen.credit));
      const link = element('a', 'project-dialog-listen-link', project.listen.label);
      link.href = project.listen.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', project.listen.label + ' (opens in a new tab)');
      const arrow = element('span', '', '\u2197');
      arrow.setAttribute('aria-hidden', 'true');
      link.append(arrow);
      listen.append(link);
      copy.append(listen);
    }
    project.paragraphs.forEach(text => copy.append(element('p', '', text)));
    if (project.note) copy.append(element('p', 'project-dialog-note', project.note));
    if (project.source) {
      const source = element('footer', 'project-dialog-source');
      const link = element('a', '', project.source.label);
      link.href = project.source.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      source.append(link, element('p', '', project.source.credit));
      project.source.references?.forEach(reference => {
        const link = element('a', 'project-dialog-reference', reference.label);
        link.href = reference.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        source.append(link);
      });
      copy.append(source);
    }
    layout.append(aside, copy);
    scroll.replaceChildren(layout);
  }

  function open(trigger) {
    if (dialog.open) return;
    const project = projectDetails[trigger.dataset.projectDetail];
    if (!project) return;
    onOpen();
    opener = trigger;
    const section = trigger.closest('.portal-section');
    saved = {
      x: window.scrollX,
      y: window.scrollY,
      section,
      sectionOffset: section ? -section.getBoundingClientRect().top : 0,
      sectionScroll: section?.scrollTop || 0
    };
    fill(project);
    outsidePointerDown = false;
    document.documentElement.style.setProperty('--project-dialog-scrollbar',
      (window.innerWidth - document.documentElement.clientWidth) + 'px');
    document.documentElement.classList.add('project-dialog-open');
    document.documentElement.classList.remove('fish-enabled');
    dialog.showModal();
    scroll.scrollTop = 0;
    closeButton.focus({ preventScroll: true });
    trigger.setAttribute('aria-expanded', 'true');
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('project-dialog-open');
    document.documentElement.style.removeProperty('--project-dialog-scrollbar');
    onClose();
    if (saved) {
      const mobile = document.documentElement.classList.contains('mobile-pages');
      const top = !mobile && saved.section
        ? saved.section.getBoundingClientRect().top + window.scrollY + saved.sectionOffset
        : saved.y;
      window.scrollTo({ left: saved.x, top, behavior: 'instant' });
      if (saved.section) saved.section.scrollTop = saved.sectionScroll;
    }
    opener?.setAttribute('aria-expanded', 'false');
    opener?.focus({ preventScroll: true });
    saved = null;
  });
  closeButton.addEventListener('click', close);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });

  function outside(event) {
    const bounds = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom);
  }
  dialog.addEventListener('pointerdown', event => { outsidePointerDown = outside(event); });
  dialog.addEventListener('click', event => {
    if (outsidePointerDown && outside(event)) close();
    outsidePointerDown = false;
  });
  // Keep reading gestures inside the dialog, including at the end of its text.
  dialog.addEventListener('wheel', event => { event.stopPropagation(); }, { passive: true });
  dialog.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href], button, input, textarea, select, [tabindex]')]
      .filter(node => node.tabIndex >= 0 && !node.disabled && node.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus({ preventScroll: true });
    }
  });

  triggers.forEach(trigger => {
    trigger.setAttribute('aria-controls', dialog.id);
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', () => open(trigger));
  });
  return { isOpen: () => dialog.open };
}
